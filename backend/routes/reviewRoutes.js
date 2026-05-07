import express from "express";
import {
  createReview,
  getProductReviews,
  getCustomerReviews,
  getVendorReviews,
  getAllReviews,
  updateReviewStatus,
  respondToReview,
  voteOnReview,
  deleteReview,
  getReviewStats,
} from "../controllers/reviewController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/product/:productId", getProductReviews);

// Customer routes
router.use(protect);
router.post("/", createReview);
router.get("/my", getCustomerReviews);
router.post("/:reviewId/vote", voteOnReview);
router.delete("/:reviewId", deleteReview);

// Vendor routes
router.get("/vendor/my", getVendorReviews);
router.post("/:reviewId/respond", respondToReview);

// Admin only routes
router.get("/", authorize("admin"), getAllReviews);
router.put("/:reviewId/status", authorize("admin"), updateReviewStatus);
router.get("/stats/summary", authorize("admin"), getReviewStats);

export default router;
