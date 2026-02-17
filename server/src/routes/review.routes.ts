import { Router } from "express";
import { authenticate } from "../middleware/auth";
import {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
} from "../controllers/review.controller";

const router = Router();

router.get("/product/:productId", getProductReviews);
router.post("/", authenticate, createReview);
router.patch("/:id", authenticate, updateReview);
router.delete("/:id", authenticate, deleteReview);

export default router;
