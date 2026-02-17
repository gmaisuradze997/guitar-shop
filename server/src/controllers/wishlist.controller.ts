import { Request, Response, NextFunction } from "express";
import { prisma } from "../utils/prisma";
import { AppError } from "../middleware/errorHandler";

/**
 * GET /api/wishlist -- return user's wishlist items with product data
 */
export async function getWishlist(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;

    const items = await prisma.wishlistItem.findMany({
      where: { userId },
      include: {
        product: {
          include: { category: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(items);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/wishlist -- add product to wishlist
 * Body: { productId }
 */
export async function addToWishlist(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { productId } = req.body;

    if (!productId) {
      throw new AppError("productId is required", 400);
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new AppError("Product not found", 404);
    }

    const existing = await prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    if (existing) {
      throw new AppError("Product is already in your wishlist", 400);
    }

    const item = await prisma.wishlistItem.create({
      data: { userId, productId },
      include: {
        product: {
          include: { category: true },
        },
      },
    });

    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/wishlist/:productId -- remove product from wishlist
 */
export async function removeFromWishlist(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { productId } = req.params;

    const item = await prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    if (!item) {
      throw new AppError("Item not found in wishlist", 404);
    }

    await prisma.wishlistItem.delete({
      where: { id: item.id },
    });

    res.json({ message: "Removed from wishlist" });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/wishlist/check/:productId -- check if a product is in the wishlist
 */
export async function checkWishlistItem(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { productId } = req.params;

    const item = await prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    res.json({ inWishlist: !!item });
  } catch (error) {
    next(error);
  }
}
