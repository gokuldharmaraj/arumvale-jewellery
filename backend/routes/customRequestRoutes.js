import express from "express";
import {
  createCustomRequest,
  getMyCustomRequests,
  getVendorCustomRequests,
  provideEstimate,
  respondToEstimate,
  convertToProduct,
} from "../controllers/customRequestController.js";
import {
  protect,
  authorize,
  approvedVendorOnly,
} from "../middleware/authMiddleware.js";
import { uploadDesignImage } from "../utils/uploadConfig.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Customer only - get my custom requests
router.get("/my", authorize("user"), getMyCustomRequests);

// Customer only - submit custom request
router.post("/", authorize("user"), uploadDesignImage, createCustomRequest);

// Vendor only - get vendor's custom requests
router.get("/vendor", approvedVendorOnly, getVendorCustomRequests);

// Vendor only - provide estimate for custom request
router.post("/:id/estimate", approvedVendorOnly, provideEstimate);

// Customer only - respond to estimate
router.post("/:id/respond", authorize("user"), respondToEstimate);

// Vendor only - convert approved request to product
router.post("/:id/convert", approvedVendorOnly, convertToProduct);

export default router;
