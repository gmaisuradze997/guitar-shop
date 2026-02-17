import { Request, Response, NextFunction } from "express";
import { prisma } from "../utils/prisma";
import { AppError } from "../middleware/errorHandler";

/**
 * Recalculate and persist the average rating + review count for a product.
 */
async function recalcProductRating(productId: string): Promise<void> {
  const agg = await prisma.review.aggregate({
    where: { productId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  await prisma.product.update({
    where: { id: productId },
    data: {
      rating: agg._avg.rating ?? 0,
      reviewCount: agg._count.rating,
    },
  });
}

/**
 * GET /api/reviews/product/:productId -- list reviews for a product (public)
 */
export async function getProductReviews(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { productId } = req.params;

    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(reviews);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/reviews -- create a review (auth required)
 * Body: { productId, rating, title?, body? }
 */
export async function createReview(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { productId, rating, title, body } = req.body;

    if (!productId) {
      throw new AppError("productId is required", 400);
    }
    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      throw new AppError("rating must be between 1 and 5", 400);
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new AppError("Product not found", 404);
    }

    const existing = await prisma.review.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    if (existing) {
      throw new AppError("You have already reviewed this product", 400);
    }

    const review = await prisma.review.create({
      data: {
        userId,
        productId,
        rating,
        title: title || null,
        body: body || null,
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    await recalcProductRating(productId);

    res.status(201).json(review);
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/reviews/:id -- update own review (auth required)
 * Body: { rating?, title?, body? }
 */
export async function updateReview(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const reviewId = req.params.id;
    const { rating, title, body } = req.body;

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });
    if (!review) {
      throw new AppError("Review not found", 404);
    }
    if (review.userId !== userId) {
      throw new AppError("You can only edit your own reviews", 403);
    }

    if (rating !== undefined && (typeof rating !== "number" || rating < 1 || rating > 5)) {
      throw new AppError("rating must be between 1 and 5", 400);
    }

    const updated = await prisma.review.update({
      where: { id: reviewId },
      data: {
        ...(rating !== undefined && { rating }),
        ...(title !== undefined && { title: title || null }),
        ...(body !== undefined && { body: body || null }),
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    if (rating !== undefined) {
      await recalcProductRating(review.productId);
    }

    res.json(updated);
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/reviews/:id -- delete own review (auth required)
 */
export async function deleteReview(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const reviewId = req.params.id;

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });
    if (!review) {
      throw new AppError("Review not found", 404);
    }
    if (review.userId !== userId) {
      throw new AppError("You can only delete your own reviews", 403);
    }

    await prisma.review.delete({ where: { id: reviewId } });
    await recalcProductRating(review.productId);

    res.json({ message: "Review deleted" });
  } catch (error) {
    next(error);
  }
}
