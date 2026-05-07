import Review from "../models/Review.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

// Create a new review
export const createReview = async (req, res, next) => {
  try {
    const { productId, orderId, rating, title, content, images } = req.body;

    console.log("Review submission request:", {
      productId,
      orderId,
      rating,
      title,
      content,
      userId: req.user._id,
    });

    // Validate required fields
    if (!productId || !orderId || !rating || !title || !content) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided" });
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }

    // Check if order exists and belongs to the customer
    let order;
    try {
      order = await Order.findById(orderId);
    } catch (dbError) {
      console.error("Database error finding order:", dbError);
      return res
        .status(500)
        .json({ message: "Database error while finding order" });
    }

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.customer.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to review this order" });
    }

    // Check if order is delivered
    if (order.status !== "delivered") {
      console.log("Order status check failed:", {
        orderId: order._id,
        currentStatus: order.status,
        expectedStatus: "delivered",
        customer: req.user._id,
      });
      return res.status(400).json({
        message: `Order must be delivered to be reviewed. Current status: ${order.status}`,
      });
    }

    // Check if product is in the order
    const productInOrder = order.items.some(
      (item) => item.product.toString() === productId,
    );

    if (!productInOrder) {
      return res
        .status(400)
        .json({ message: "Product not found in this order" });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      customer: req.user._id,
      product: productId,
      order: orderId,
    });

    if (existingReview) {
      return res
        .status(400)
        .json({ message: "Review already exists for this product" });
    }

    // Create review
    const review = new Review({
      customer: req.user._id,
      product: productId,
      order: orderId,
      rating,
      title,
      content,
      images: images || [],
      isVerifiedPurchase: true,
      status: "pending", 
    });

    await review.save();

    res.status(201).json({
      message:
        "Review submitted successfully. It will be visible after approval.",
      review,
    });
  } catch (error) {
    console.error("Create review error:", {
      message: error.message,
      stack: error.stack,
      body: req.body,
      user: req.user?._id,
    });
    res.status(500).json({ message: error.message });
  }
};

// Get reviews for a product
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const {
      page = 1,
      limit = 10,
      rating,
      sortBy = "reviewDate",
      sortOrder = "desc",
      verifiedOnly = false,
    } = req.query;

    // Build filter
    let filter = {
      product: productId,
      status: "approved", // Only show approved reviews publicly
    };

    if (rating) {
      filter.rating = parseInt(rating);
    }

    if (verifiedOnly === "true") {
      filter.isVerifiedPurchase = true;
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const reviews = await Review.find(filter)
      .populate("customer", "firstName lastName")
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments(filter);

    // Get rating statistics
    const ratingStats = await Review.calculateProductRating(productId);

    res.status(200).json({
      reviews,
      ratingStats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get customer's reviews
export const getCustomerReviews = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      sortBy = "reviewDate",
      sortOrder = "desc",
    } = req.query;

    // Build filter
    let filter = { customer: req.user._id };

    if (status) {
      filter.status = status;
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const reviews = await Review.find(filter)
      .populate("product", "name images")
      .populate("order", "orderDate orderNumber")
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments(filter);

    res.status(200).json({
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get vendor's reviews
export const getVendorReviews = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      rating,
      status,
      sortBy = "reviewDate",
      sortOrder = "desc",
    } = req.query;

    // Build filter
    let filter = {};

    if (rating) {
      filter.rating = parseInt(rating);
    }

    if (status) {
      filter.status = status;
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const reviews = await Review.find(filter)
      .populate({
        path: "product",
        match: { vendor: req.user._id },
        select: "name images",
      })
      .populate("customer", "firstName lastName")
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Filter out reviews for products not belonging to this vendor
    const vendorReviews = reviews.filter((review) => review.product);

    const total = await Review.countDocuments(filter);

    res.status(200).json({
      reviews: vendorReviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all reviews (for admin)
export const getAllReviews = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      rating,
      productId,
      customerId,
      sortBy = "reviewDate",
      sortOrder = "desc",
    } = req.query;

    // Build filter
    let filter = {};

    if (status) {
      filter.status = status;
    }

    if (rating) {
      filter.rating = parseInt(rating);
    }

    if (productId) {
      filter.product = productId;
    }

    if (customerId) {
      filter.customer = customerId;
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const reviews = await Review.find(filter)
      .populate("customer", "firstName lastName email")
      .populate("product", "name images vendor")
      .populate("order", "orderNumber")
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments(filter);

    res.status(200).json({
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update review status (for admin)
export const updateReviewStatus = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { status, adminNotes } = req.body;

    if (!["pending", "approved", "rejected", "hidden"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    review.status = status;
    if (adminNotes) {
      review.adminNotes = adminNotes;
    }

    await review.save();

    // Update product and vendor ratings if approved
    if (status === "approved") {
      await review.updateRatings();
    }

    res.status(200).json({
      message: "Review status updated successfully",
      review,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Respond to review (for vendor)
export const respondToReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: "Response content is required" });
    }

    const review = await Review.findById(reviewId).populate({
      path: "product",
      select: "vendor",
    });

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Check if user is the vendor of the product
    if (review.product.vendor.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to respond to this review" });
    }

    review.vendorResponse = {
      content,
      respondedAt: new Date(),
      respondedBy: req.user._id,
    };

    await review.save();

    res.status(200).json({
      message: "Response added successfully",
      review,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Vote on review (helpful/not helpful)
export const voteOnReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { voteType } = req.body; // "helpful" or "notHelpful"

    if (!["helpful", "notHelpful"].includes(voteType)) {
      return res.status(400).json({ message: "Invalid vote type" });
    }

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Increment vote count
    if (voteType === "helpful") {
      review.helpful += 1;
    } else {
      review.notHelpful += 1;
    }

    await review.save();

    res.status(200).json({
      message: "Vote recorded successfully",
      helpful: review.helpful,
      notHelpful: review.notHelpful,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete review (for admin or customer)
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Check permissions
    const isCustomer = review.customer.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isCustomer && !isAdmin) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this review" });
    }

    await Review.findByIdAndDelete(reviewId);

    // Update product and vendor ratings
    await review.updateRatings();

    res.status(200).json({
      message: "Review deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get review statistics (for admin)
export const getReviewStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.reviewDate = {};
      if (startDate) dateFilter.reviewDate.$gte = new Date(startDate);
      if (endDate) dateFilter.reviewDate.$lte = new Date(endDate);
    }

    const stats = await Review.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          pendingReviews: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
          },
          approvedReviews: {
            $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] },
          },
          rejectedReviews: {
            $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] },
          },
          averageRating: { $avg: "$rating" },
          fiveStarReviews: {
            $sum: { $cond: [{ $eq: ["$rating", 5] }, 1, 0] },
          },
          fourStarReviews: {
            $sum: { $cond: [{ $eq: ["$rating", 4] }, 1, 0] },
          },
          threeStarReviews: {
            $sum: { $cond: [{ $eq: ["$rating", 3] }, 1, 0] },
          },
          twoStarReviews: {
            $sum: { $cond: [{ $eq: ["$rating", 2] }, 1, 0] },
          },
          oneStarReviews: {
            $sum: { $cond: [{ $eq: ["$rating", 1] }, 1, 0] },
          },
        },
      },
    ]);

    const result = stats[0] || {
      totalReviews: 0,
      pendingReviews: 0,
      approvedReviews: 0,
      rejectedReviews: 0,
      averageRating: 0,
      fiveStarReviews: 0,
      fourStarReviews: 0,
      threeStarReviews: 0,
      twoStarReviews: 0,
      oneStarReviews: 0,
    };

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
