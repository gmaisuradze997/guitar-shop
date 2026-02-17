import { Router } from "express";
import { authenticate } from "../middleware/auth";
import {
  getUserOrders,
  getOrderById,
  createOrder,
} from "../controllers/order.controller";

const router = Router();

// All order routes require authentication
router.use(authenticate);

router.get("/", getUserOrders);
router.get("/:id", getOrderById);
router.post("/", createOrder);

export default router;
