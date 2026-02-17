import { Request, Response, NextFunction } from "express";
import { prisma } from "../utils/prisma";
import { AppError } from "../middleware/errorHandler";

// Valid sort options mapping
const SORT_OPTIONS: Record<string, Record<string, string>> = {
  newest: { createdAt: "desc" },
  oldest: { createdAt: "asc" },
  "price-asc": { price: "asc" },
  "price-desc": { price: "desc" },
  "name-asc": { name: "asc" },
  "name-desc": { name: "desc" },
  "rating": { rating: "desc" },
};

export async function getProducts(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const category = req.query.category as string | undefined;
    const brand = req.query.brand as string | undefined;
    const search = req.query.search as string | undefined;
    const sort = (req.query.sort as string) || "newest";
    const inStock = req.query.inStock as string | undefined;
    const minPrice = req.query.minPrice
      ? parseFloat(req.query.minPrice as string)
      : undefined;
    const maxPrice = req.query.maxPrice
      ? parseFloat(req.query.maxPrice as string)
      : undefined;

    const where: Record<string, unknown> = {};

    if (category) {
      const cat = await prisma.category.findUnique({
        where: { slug: category },
        include: { children: { select: { id: true } } },
      });

      if (cat) {
        if (cat.children.length > 0) {
          const childIds = cat.children.map((c) => c.id);
          where.categoryId = { in: [cat.id, ...childIds] };
        } else {
          where.category = { slug: category };
        }
      } else {
        where.category = { slug: category };
      }
    }

    if (brand) {
      where.brand = brand;
    }

    if (inStock === "true") {
      where.inStock = true;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {
        ...(minPrice !== undefined && { gte: minPrice }),
        ...(maxPrice !== undefined && { lte: maxPrice }),
      };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { brand: { contains: search, mode: "insensitive" } },
      ];
    }

    const orderBy = SORT_OPTIONS[sort] ?? SORT_OPTIONS.newest;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
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
// Filter options (all brands + price range) for the shop sidebar
// ---------------------------------------------------------------------------

export async function getFilterOptions(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const [brands, priceRange] = await Promise.all([
      prisma.product.findMany({
        select: { brand: true },
        distinct: ["brand"],
        orderBy: { brand: "asc" },
      }),
      prisma.product.aggregate({
        _min: { price: true },
        _max: { price: true },
      }),
    ]);

    res.json({
      brands: brands.map((b) => b.brand),
      priceRange: {
        min: priceRange._min.price ?? 0,
        max: priceRange._max.price ?? 1000,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getProductBySlug(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const slug = req.params.slug as string;
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        reviews: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
}

export async function getProductById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id as string;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        reviews: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
}

export async function getCategories(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const categories = await prisma.category.findMany({
      where: { parentId: null },
      include: {
        children: {
          orderBy: { name: "asc" },
        },
        _count: { select: { products: true } },
      },
      orderBy: { name: "asc" },
    });

    res.json(categories);
  } catch (error) {
    next(error);
  }
}

export async function getCategoryBySlug(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const slug = req.params.slug as string;
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        children: { orderBy: { name: "asc" } },
        parent: true,
        _count: { select: { products: true } },
      },
    });

    if (!category) {
      throw new AppError("Category not found", 404);
    }

    res.json(category);
  } catch (error) {
    next(error);
  }
}
