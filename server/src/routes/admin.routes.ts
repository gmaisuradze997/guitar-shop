import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/auth";
import {
  getAnalytics,
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getAdminOrders,
  updateOrderStatus,
  getAdminCustomers,
} from "../controllers/admin.controller";

const router = Router();

// All admin routes require authentication + admin role
router.use(authenticate, authorize("admin"));

// Analytics
router.get("/analytics", getAnalytics);

// Products CRUD
router.get("/products", getAdminProducts);
router.post("/products", createProduct);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);

// Orders
router.get("/orders", getAdminOrders);
router.patch("/orders/:id/status", updateOrderStatus);

// Customers
router.get("/customers", getAdminCustomers);

export default router;
