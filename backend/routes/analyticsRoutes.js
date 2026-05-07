import express from "express";
import {
  getDashboardAnalytics,
  getVendorAnalytics,
  getSalesReport,
  getInventoryReport,
  getCustomerAnalytics,
} from "../controllers/analyticsController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Admin only routes
router.get("/dashboard", authorize("admin"), getDashboardAnalytics);
router.get("/sales", authorize("admin"), getSalesReport);
router.get("/inventory", authorize("admin"), getInventoryReport);

// Vendor routes
router.get("/vendor", getVendorAnalytics);

// Customer routes
router.get("/customer", getCustomerAnalytics);

export default router;
