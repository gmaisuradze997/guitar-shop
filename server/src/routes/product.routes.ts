import { Router } from "express";
import {
  getProducts,
  getProductById,
  getProductBySlug,
  getCategories,
  getCategoryBySlug,
  getFilterOptions,
} from "../controllers/product.controller";

const router = Router();

router.get("/", getProducts);
router.get("/categories", getCategories);
router.get("/categories/:slug", getCategoryBySlug);
router.get("/filters", getFilterOptions);
router.get("/slug/:slug", getProductBySlug);
router.get("/:id", getProductById);

export default router;
