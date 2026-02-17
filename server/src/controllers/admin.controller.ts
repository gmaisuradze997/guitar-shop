import { Request, Response, NextFunction } from "express";
import { prisma } from "../utils/prisma";
import { AppError } from "../middleware/errorHandler";

// ---------------------------------------------------------------------------
// Analytics
// ---------------------------------------------------------------------------

export async function getAnalytics(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const [
      totalRevenue,
      totalOrders,
      totalCustomers,
      totalProducts,
      ordersByStatus,
      recentOrders,
      topProducts,
      monthlySales,
    ] = await Promise.all([
      // Total revenue (delivered + processing + shipped orders)
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { notIn: ["cancelled"] } },
      }),

      // Total orders
      prisma.order.count(),

      // Total customers
      prisma.user.count({ where: { role: "customer" } }),

      // Total products
      prisma.product.count(),

      // Orders grouped by status
      prisma.order.groupBy({
        by: ["status"],
        _count: { id: true },
      }),

      // Recent 5 orders
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          items: { select: { quantity: true } },
        },
      }),

      // Top 5 best-selling products
      prisma.orderItem.groupBy({
        by: ["productId"],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
      }),

      // Monthly sales for the last 12 months
      prisma.$queryRaw<Array<{ month: string; revenue: number; orders: number }>>`
        SELECT
          TO_CHAR(DATE_TRUNC('month', "createdAt"), 'YYYY-MM') AS month,
          COALESCE(SUM(total), 0)::float AS revenue,
          COUNT(*)::int AS orders
        FROM orders
        WHERE "createdAt" >= NOW() - INTERVAL '12 months'
          AND status != 'cancelled'
        GROUP BY DATE_TRUNC('month', "createdAt")
        ORDER BY month ASC
      `,
    ]);

    // Resolve product names for top products
    const topProductIds = topProducts.map((p) => p.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: topProductIds } },
      select: { id: true, name: true, images: true, price: true },
    });

    const topProductsWithDetails = topProducts.map((tp) => {
      const product = products.find((p) => p.id === tp.productId);
      return {
        productId: tp.productId,
        totalSold: tp._sum.quantity ?? 0,
        name: product?.name ?? "Unknown Product",
        image: product?.images?.[0] ?? null,
        price: product?.price ?? 0,
      };
    });

    const statusDistribution = ordersByStatus.reduce(
      (acc, item) => {
        acc[item.status] = item._count.id;
        return acc;
      },
      {} as Record<string, number>
    );

    res.json({
      totalRevenue: totalRevenue._sum.total ?? 0,
      totalOrders,
      totalCustomers,
      totalProducts,
      statusDistribution,
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        status: o.status,
        total: o.total,
        itemCount: o.items.reduce((sum, i) => sum + i.quantity, 0),
        createdAt: o.createdAt,
        user: o.user,
      })),
      topProducts: topProductsWithDetails,
      monthlySales,
    });
  } catch (error) {
    next(error);
  }
}

// ---------------------------------------------------------------------------
// Products — List (paginated, searchable)
// ---------------------------------------------------------------------------

export async function getAdminProducts(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const search = req.query.search as string | undefined;
    const category = req.query.category as string | undefined;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { brand: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category) {
      where.category = { slug: category };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: { select: { id: true, name: true, slug: true } } },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      data: products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
}

// ---------------------------------------------------------------------------
// Products — Create
// ---------------------------------------------------------------------------

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export async function createProduct(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const {
      name,
      description,
      price,
      compareAtPrice,
      categoryId,
      brand,
      images,
      inStock,
      stockCount,
    } = req.body;

    if (!name || !description || price === undefined || !categoryId || !brand) {
      throw new AppError(
        "Name, description, price, categoryId, and brand are required",
        400
      );
    }

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      throw new AppError("Category not found", 404);
    }

    // Generate unique slug
    let slug = slugify(name);
    const existingSlug = await prisma.product.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price: parseFloat(price),
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
        categoryId,
        brand,
        images: images || [],
        inStock: inStock ?? true,
        stockCount: parseInt(stockCount) || 0,
      },
      include: { category: { select: { id: true, name: true, slug: true } } },
    });

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
}

// ---------------------------------------------------------------------------
// Products — Update
// ---------------------------------------------------------------------------

export async function updateProduct(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError("Product not found", 404);
    }

    const {
      name,
      description,
      price,
      compareAtPrice,
      categoryId,
      brand,
      images,
      inStock,
      stockCount,
    } = req.body;

    // If categoryId is changing, verify it exists
    if (categoryId && categoryId !== existing.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
      });
      if (!category) {
        throw new AppError("Category not found", 404);
      }
    }

    // If name changes, regenerate slug
    let slug = existing.slug;
    if (name && name !== existing.name) {
      slug = slugify(name);
      const existingSlug = await prisma.product.findFirst({
        where: { slug, id: { not: id } },
      });
      if (existingSlug) {
        slug = `${slug}-${Date.now().toString(36)}`;
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(name !== undefined && { slug }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(compareAtPrice !== undefined && {
          compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
        }),
        ...(categoryId !== undefined && { categoryId }),
        ...(brand !== undefined && { brand }),
        ...(images !== undefined && { images }),
        ...(inStock !== undefined && { inStock }),
        ...(stockCount !== undefined && { stockCount: parseInt(stockCount) }),
      },
      include: { category: { select: { id: true, name: true, slug: true } } },
    });

    res.json(product);
  } catch (error) {
    next(error);
  }
}

// ---------------------------------------------------------------------------
// Products — Delete
// ---------------------------------------------------------------------------

export async function deleteProduct(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError("Product not found", 404);
    }

    // Remove related cart items and wishlist items first
    await prisma.$transaction([
      prisma.cartItem.deleteMany({ where: { productId: id } }),
      prisma.wishlistItem.deleteMany({ where: { productId: id } }),
      prisma.review.deleteMany({ where: { productId: id } }),
      prisma.product.delete({ where: { id } }),
    ]);

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    next(error);
  }
}

// ---------------------------------------------------------------------------
// Orders — List all (paginated, filterable by status)
// ---------------------------------------------------------------------------

export async function getAdminOrders(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const status = req.query.status as string | undefined;
    const search = req.query.search as string | undefined;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (status && status !== "all") {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { id: { contains: search, mode: "insensitive" } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { user: { firstName: { contains: search, mode: "insensitive" } } },
        { user: { lastName: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          items: {
            include: {
              product: {
                select: { id: true, slug: true, images: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    res.json({
      data: orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
}

// ---------------------------------------------------------------------------
// Orders — Update status
// ---------------------------------------------------------------------------

const VALID_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

export async function updateOrderStatus(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id;
    const { status } = req.body;

    if (!status || !VALID_STATUSES.includes(status)) {
      throw new AppError(
        `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
        400
      );
    }

    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError("Order not found", 404);
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              select: { id: true, slug: true, images: true },
            },
          },
        },
      },
    });

    res.json(order);
  } catch (error) {
    next(error);
  }
}

// ---------------------------------------------------------------------------
// Customers — List (paginated, searchable)
// ---------------------------------------------------------------------------

export async function getAdminCustomers(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const search = req.query.search as string | undefined;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { role: "customer" };

    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
      ];
      delete where.role;
      where.AND = [
        { role: "customer" },
        {
          OR: [
            { email: { contains: search, mode: "insensitive" } },
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
          ],
        },
      ];
      delete where.OR;
    }

    const [customers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true,
          _count: {
            select: { orders: true, reviews: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    // Get total spent per customer
    const customerIds = customers.map((c) => c.id);
    const orderTotals = await prisma.order.groupBy({
      by: ["userId"],
      where: {
        userId: { in: customerIds },
        status: { notIn: ["cancelled"] },
      },
      _sum: { total: true },
    });

    const totalsMap = new Map(
      orderTotals.map((o) => [o.userId, o._sum.total ?? 0])
    );

    const enrichedCustomers = customers.map((c) => ({
      ...c,
      totalSpent: totalsMap.get(c.id) ?? 0,
    }));

    res.json({
      data: enrichedCustomers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
}
