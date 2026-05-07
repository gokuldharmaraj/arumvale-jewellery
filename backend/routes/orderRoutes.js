import express from "express";
import {
  createOrder,
  getAllOrders,
  getUserOrders,
  getVendorOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  cancelOrder,
  getOrderStats,
} from "../controllers/orderController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Customer routes
router.post("/", createOrder);
router.get("/my", getUserOrders);
router.get("/:id", getOrderById);
router.put("/:id/cancel", cancelOrder);

// Vendor routes
router.get("/vendor/my", getVendorOrders);
router.put("/:id/status", updateOrderStatus);

// Admin only routes
router.get("/", authorize("admin"), getAllOrders);
router.put("/:id/payment-status", authorize("admin"), updatePaymentStatus);
router.get("/stats/summary", authorize("admin"), getOrderStats);

export default router;
