import { Router } from "express";
import { authenticate } from "../middleware/auth";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlistItem,
} from "../controllers/wishlist.controller";

const router = Router();

router.get("/", authenticate, getWishlist);
router.post("/", authenticate, addToWishlist);
router.get("/check/:productId", authenticate, checkWishlistItem);
router.delete("/:productId", authenticate, removeFromWishlist);

export default router;
