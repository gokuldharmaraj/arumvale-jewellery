import express from "express";
import {
  getPendingVendors,
  approveVendor,
  rejectVendor,
  getAllVendors,
  getVendorStats,
  getVendorDetails,
  getUserStats,
  getAllUsers,
  getUserDetails,
  toggleUserStatus,
  getAllProducts,
  getProductStats,
  toggleProductStatus,
  getProductDetails,
  getAllOrders,
  getOrderStats,
  getOrderDetails,
  updateOrderStatus,
} from "../controllers/adminController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(adminOnly);

// Get pending vendors
router.get("/vendors/pending", getPendingVendors);

// Approve vendor
router.post("/vendors/:id/approve", approveVendor);

// Reject vendor
router.post("/vendors/:id/reject", rejectVendor);

// Get all vendors with filtering
router.get("/vendors", getAllVendors);

// Get vendor statistics
router.get("/vendors/stats", getVendorStats);

// Get single vendor details
router.get("/vendors/:id", getVendorDetails);

// User management routes
// Get user statistics
router.get("/users/stats", getUserStats);

// Get all users with filtering
router.get("/users", getAllUsers);

// Get single user details
router.get("/users/:id", getUserDetails);

// Suspend/Activate user
router.put("/users/:id/toggle-status", toggleUserStatus);

// Product management routes
// Get product statistics
router.get("/products/stats", getProductStats);

// Get all products with filtering
router.get("/products", getAllProducts);

// Get single product details
router.get("/products/:id", getProductDetails);

// Block/Unblock product
router.put("/products/:id/toggle-status", toggleProductStatus);

// Order management routes
// Get order statistics
router.get("/orders/stats", getOrderStats);

// Get all orders with filtering
router.get("/orders", getAllOrders);

// Get single order details
router.get("/orders/:id", getOrderDetails);

// Update order status
router.put("/orders/:id/status", updateOrderStatus);

export default router;
