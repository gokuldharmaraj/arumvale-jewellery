import express from "express";
import {
  getVendorProfile,
  getAllVendors,
  getApprovedVendors,
  updateVendorProfile,
  approveVendor,
  toggleVendorStatus,
  getVendorStats,
  deleteVendor,
} from "../controllers/vendorController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public route for approved vendors (customer-facing)
router.get("/approved", getApprovedVendors);

// All other routes require authentication
router.use(protect);

// Vendor routes
router.get("/profile", getVendorProfile);
router.put("/profile", updateVendorProfile);
router.get("/stats", getVendorStats);

// Admin only routes
router.get("/", authorize("admin"), getAllVendors);
router.put("/:vendorId/approve", authorize("admin"), approveVendor);
router.put("/:vendorId/toggle-status", authorize("admin"), toggleVendorStatus);
router.delete("/:vendorId", authorize("admin"), deleteVendor);

export default router;
