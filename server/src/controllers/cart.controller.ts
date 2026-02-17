import { Request, Response, NextFunction } from "express";
import { prisma } from "../utils/prisma";
import { AppError } from "../middleware/errorHandler";

/**
 * GET /api/cart -- return the authenticated user's cart with items + product data
 */
export async function getCart(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;

    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: { category: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: {
                include: { category: true },
              },
            },
            orderBy: { createdAt: "asc" },
          },
        },
      });
    }

    res.json(cart);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/cart/items -- add an item (or increase quantity) in the cart
 * Body: { productId: string, quantity?: number }
 */
export async function addCartItem(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      throw new AppError("productId is required", 400);
    }
    if (quantity < 1) {
      throw new AppError("quantity must be at least 1", 400);
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new AppError("Product not found", 404);
    }
    if (!product.inStock || product.stockCount < quantity) {
      throw new AppError("Product is out of stock", 400);
    }

    // Upsert cart
    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
    }

    // Upsert item -- if it already exists, increment quantity
    const existingItem = await prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } },
    });

    if (existingItem) {
      const newQty = existingItem.quantity + quantity;
      if (newQty > product.stockCount) {
        throw new AppError(
          `Only ${product.stockCount} units available`,
          400
        );
      }
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQty },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
        },
      });
    }

    // Return full cart
    const updatedCart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: { include: { category: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    res.json(updatedCart);
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/cart/items/:itemId -- update quantity of a cart item
 * Body: { quantity: number }
 */
export async function updateCartItem(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const itemId = req.params.itemId as string;
    const { quantity } = req.body;

    if (typeof quantity !== "number" || quantity < 0) {
      throw new AppError("quantity must be a non-negative number", 400);
    }

    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      throw new AppError("Cart not found", 404);
    }

    const item = await prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
      include: { product: true },
    });
    if (!item) {
      throw new AppError("Cart item not found", 404);
    }

    if (quantity === 0) {
      await prisma.cartItem.delete({ where: { id: itemId } });
    } else {
      if (quantity > item.product.stockCount) {
        throw new AppError(
          `Only ${item.product.stockCount} units available`,
          400
        );
      }
      await prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity },
      });
    }

    const updatedCart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: { include: { category: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    res.json(updatedCart);
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/cart/items/:itemId -- remove a single item from the cart
 */
export async function removeCartItem(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const itemId = req.params.itemId as string;

    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      throw new AppError("Cart not found", 404);
    }

    const item = await prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
    });
    if (!item) {
      throw new AppError("Cart item not found", 404);
    }

    await prisma.cartItem.delete({ where: { id: itemId } });

    const updatedCart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: { include: { category: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    res.json(updatedCart);
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/cart -- clear all items in the cart
 */
export async function clearCart(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;

    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      throw new AppError("Cart not found", 404);
    }

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    const updatedCart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: { include: { category: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    res.json(updatedCart);
  } catch (error) {
    next(error);
  }
}
