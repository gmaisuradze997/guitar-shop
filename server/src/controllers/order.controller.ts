import { Request, Response, NextFunction } from "express";
import { prisma } from "../utils/prisma";
import { AppError } from "../middleware/errorHandler";

/**
 * GET /api/orders -- return the authenticated user's orders (paginated, newest first)
 * Query params: page (default 1), limit (default 10)
 */
export async function getUserOrders(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId },
        include: {
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
      prisma.order.count({ where: { userId } }),
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

/**
 * GET /api/orders/:id -- return a single order (must belong to the authenticated user)
 */
export async function getOrderById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const orderId = req.params.id;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, slug: true, images: true, inStock: true },
            },
          },
        },
      },
    });

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    if (order.userId !== userId && req.user!.role !== "admin") {
      throw new AppError("Order not found", 404);
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/orders -- create an order from the authenticated user's cart
 * Body: { shippingAddress: { line1, line2?, city, state, postalCode, country } }
 */
export async function createOrder(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { shippingAddress } = req.body;

    if (
      !shippingAddress ||
      !shippingAddress.line1 ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.postalCode ||
      !shippingAddress.country
    ) {
      throw new AppError("Complete shipping address is required", 400);
    }

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new AppError("Cart is empty", 400);
    }

    // Validate stock for all items
    for (const item of cart.items) {
      if (!item.product.inStock || item.product.stockCount < item.quantity) {
        throw new AppError(
          `"${item.product.name}" is out of stock or has insufficient quantity`,
          400
        );
      }
    }

    // Calculate totals
    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    const FREE_SHIPPING_THRESHOLD = 50;
    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 5.99;
    const taxRate = 0.08;
    const tax = parseFloat((subtotal * taxRate).toFixed(2));
    const total = parseFloat((subtotal + shipping + tax).toFixed(2));

    // Create order and clear cart in a transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId,
          status: "pending",
          subtotal,
          tax,
          shipping,
          total,
          shippingLine1: shippingAddress.line1,
          shippingLine2: shippingAddress.line2 || null,
          shippingCity: shippingAddress.city,
          shippingState: shippingAddress.state,
          shippingPostal: shippingAddress.postalCode,
          shippingCountry: shippingAddress.country,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              name: item.product.name,
              price: item.product.price,
              quantity: item.quantity,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: {
                select: { id: true, slug: true, images: true },
              },
            },
          },
        },
      });

      // Decrement stock counts
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockCount: { decrement: item.quantity },
            inStock: item.product.stockCount - item.quantity > 0,
          },
        });
      }

      // Clear the cart
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return newOrder;
    });

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
}
