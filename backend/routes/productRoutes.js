import express from "express";
import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  getVendorProducts,
  removeProductImage,
} from "../controllers/productController.js";
import { protect, approvedVendorOnly } from "../middleware/authMiddleware.js";
import { uploadProductImages } from "../utils/uploadConfig.js";

const router = express.Router();

// Public routes - no authentication required
router.get("/", getProducts);

// Get vendor's products (approved vendors only) - must come before /:id
router.get("/my", protect, approvedVendorOnly, getVendorProducts);
router.get("/:id", getProduct);

// Protected routes - require approved vendor authentication
router.use(protect);
router.use(approvedVendorOnly);

// Create product (approved vendors only) - handle multipart/form-data
router.post("/", uploadProductImages, createProduct);

// Update product stock (vendor can only update their products) - handle application/json
router.patch("/:id/stock", updateProduct);

// Update product (vendor can only update their products) - handle multipart/form-data
router.put("/:id", uploadProductImages, updateProduct);

// Delete product (vendor can only delete their products)
router.delete("/:id", deleteProduct);

// Remove product image (vendor can only update their products)
router.delete("/:id/images/:imageUrl", removeProductImage);

export default router;
