import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import mongoose from "mongoose";

// Get all pending vendors
export const getPendingVendors = async (req, res) => {
  try {
    const pendingVendors = await User.find({
      role: "vendor",
      isApproved: false,
    }).select("-password");

    res.status(200).json({
      count: pendingVendors.length,
      vendors: pendingVendors,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Approve vendor
export const approveVendor = async (req, res) => {
  try {
    const vendor = await User.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    if (vendor.role !== "vendor") {
      return res.status(400).json({ message: "User is not a vendor" });
    }

    if (vendor.isApproved) {
      return res.status(400).json({ message: "Vendor is already approved" });
    }

    vendor.isApproved = true;
    vendor.approvalDate = new Date();
    vendor.rejectedReason = null;

    await vendor.save();

    res.status(200).json({
      message: "Vendor approved successfully",
      vendor: {
        _id: vendor._id,
        username: vendor.username,
        email: vendor.email,
        approvalDate: vendor.approvalDate,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reject vendor
export const rejectVendor = async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ message: "Rejection reason is required" });
    }

    const vendor = await User.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    if (vendor.role !== "vendor") {
      return res.status(400).json({ message: "User is not a vendor" });
    }

    if (vendor.isApproved) {
      return res
        .status(400)
        .json({ message: "Cannot reject an approved vendor" });
    }

    vendor.isApproved = false;
    vendor.rejectedReason = reason;
    vendor.adminNotes = req.body.adminNotes || null;

    await vendor.save();

    res.status(200).json({
      message: "Vendor rejected successfully",
      vendor: {
        _id: vendor._id,
        username: vendor.username,
        email: vendor.email,
        rejectedReason: vendor.rejectedReason,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all vendors (approved, pending, rejected)
export const getAllVendors = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    let filter = { role: "vendor" };

    if (status === "approved") {
      filter.isApproved = true;
    } else if (status === "pending") {
      filter.isApproved = false;
      filter.rejectedReason = null;
    } else if (status === "rejected") {
      filter.isApproved = false;
      filter.rejectedReason = { $ne: null };
    }

    const vendors = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filter);

    res.status(200).json({
      vendors,
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

// Get vendor statistics
export const getVendorStats = async (req, res) => {
  try {
    const totalVendors = await User.countDocuments({ role: "vendor" });
    const approvedVendors = await User.countDocuments({
      role: "vendor",
      isApproved: true,
    });
    const pendingVendors = await User.countDocuments({
      role: "vendor",
      isApproved: false,
      rejectedReason: null,
    });
    const rejectedVendors = await User.countDocuments({
      role: "vendor",
      isApproved: false,
      rejectedReason: { $ne: null },
    });

    res.status(200).json({
      total: totalVendors,
      approved: approvedVendors,
      pending: pendingVendors,
      rejected: rejectedVendors,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single vendor details
export const getVendorDetails = async (req, res) => {
  try {
    const vendor = await User.findById(req.params.id).select("-password");

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    if (vendor.role !== "vendor") {
      return res.status(400).json({ message: "User is not a vendor" });
    }

    res.status(200).json(vendor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user statistics
export const getUserStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalUsers = await User.countDocuments({ role: "user" });
    const activeUsers = await User.countDocuments({
      role: "user",
      isActive: { $ne: false },
    });
    const suspendedUsers = await User.countDocuments({
      role: "user",
      isActive: false,
    });
    const newUsersToday = await User.countDocuments({
      role: "user",
      createdAt: { $gte: today },
    });

    res.status(200).json({
      total: totalUsers,
      active: activeUsers,
      suspended: suspendedUsers,
      newToday: newUsersToday,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all users with pagination and filtering
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;

    let filter = { role: "user" };

    if (status === "active") {
      filter.isActive = { $ne: false };
    } else if (status === "suspended") {
      filter.isActive = false;
    }

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get order statistics for each user
    const Order = mongoose.model("Order");
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const orderStats = await Order.aggregate([
          { $match: { customer: user._id } },
          {
            $group: {
              _id: null,
              orderCount: { $sum: 1 },
              totalSpent: { $sum: "$total" },
            },
          },
        ]);

        const stats = orderStats[0] || { orderCount: 0, totalSpent: 0 };

        return {
          ...user.toObject(),
          orderCount: stats.orderCount,
          totalSpent: stats.totalSpent,
        };
      }),
    );

    const total = await User.countDocuments(filter);

    res.status(200).json({
      users: usersWithStats,
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

// Get single user details
export const getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get user's order statistics
    const Order = mongoose.model("Order");
    const orderStats = await Order.aggregate([
      { $match: { customer: user._id } },
      {
        $group: {
          _id: null,
          orderCount: { $sum: 1 },
          totalSpent: { $sum: "$total" },
        },
      },
    ]);

    const stats = orderStats[0] || { orderCount: 0, totalSpent: 0 };

    // Get recent orders
    const recentOrders = await Order.find({ customer: user._id })
      .populate("items.product", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      user: {
        ...user.toObject(),
        orderCount: stats.orderCount,
        totalSpent: stats.totalSpent,
      },
      recentOrders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Suspend/Activate user
export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "admin") {
      return res.status(400).json({ message: "Cannot suspend admin user" });
    }

    user.isActive = isActive;
    await user.save();

    res.status(200).json({
      message: `User ${isActive ? "activated" : "suspended"} successfully`,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all products for admin (including inactive/blocked)
export const getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      category,
      search,
      vendor,
    } = req.query;

    // Build filter
    let filter = {
      isDeleted: false,
    };

    if (status) {
      filter.status = status;
    }

    if (category) {
      filter.category = category;
    }

    if (vendor) {
      filter.vendor = vendor;
    }

    if (search) {
      filter.$text = { $search: search };
    }

    const products = await Product.find(filter)
      .populate("vendor", "username email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(filter);

    res.status(200).json({
      products,
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

// Get product statistics for admin
export const getProductStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments({ isDeleted: false });
    const activeProducts = await Product.countDocuments({
      isDeleted: false,
      status: "active",
    });
    const draftProducts = await Product.countDocuments({
      isDeleted: false,
      status: "draft",
    });
    const lowStockProducts = await Product.countDocuments({
      isDeleted: false,
      stock: { $lte: 5 },
    });

    // Calculate average rating across all products
    const ratingStats = await Product.aggregate([
      { $match: { isDeleted: false, averageRating: { $gt: 0 } } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$averageRating" },
          ratedProducts: { $sum: 1 },
        },
      },
    ]);

    const ratingData = ratingStats[0] || { averageRating: 0, ratedProducts: 0 };

    res.status(200).json({
      total: totalProducts,
      active: activeProducts,
      draft: draftProducts,
      lowStock: lowStockProducts,
      averageRating: ratingData.averageRating,
      ratedProducts: ratingData.ratedProducts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Toggle product status (block/unblock)
export const toggleProductStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "draft"].includes(status)) {
      return res
        .status(400)
        .json({ message: "Invalid status. Must be 'active' or 'draft'" });
    }

    const product = await Product.findById(id);

    if (!product || product.isDeleted) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.status = status;
    await product.save();

    const updatedProduct = await Product.findById(id).populate(
      "vendor",
      "username email",
    );

    res.status(200).json({
      message: `Product ${status === "active" ? "activated" : "blocked"} successfully`,
      product: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single product details for admin
export const getProductDetails = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "vendor",
      "username email phone",
    );

    if (!product || product.isDeleted) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all orders for admin
export const getAllOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      paymentStatus,
      startDate,
      endDate,
      search,
      sortBy = "orderDate",
      sortOrder = "desc",
    } = req.query;

    // Build filter
    let filter = {};

    if (status) {
      filter.status = status;
    }

    if (paymentStatus) {
      filter.paymentStatus = paymentStatus;
    }

    if (startDate || endDate) {
      filter.orderDate = {};
      if (startDate) filter.orderDate.$gte = new Date(startDate);
      if (endDate) filter.orderDate.$lte = new Date(endDate);
    }

    if (search) {
      filter.$or = [
        { "customer.firstName": { $regex: search, $options: "i" } },
        { "customer.lastName": { $regex: search, $options: "i" } },
        { "customer.email": { $regex: search, $options: "i" } },
        { orderNumber: { $regex: search, $options: "i" } },
      ];
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const orders = await Order.find(filter)
      .populate("customer", "firstName lastName email phone")
      .populate("items.product", "name images")
      .populate("vendors.vendor", "username email")
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(filter);

    res.status(200).json({
      orders,
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

// Get order statistics for admin
export const getOrderStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.orderDate = {};
      if (startDate) dateFilter.orderDate.$gte = new Date(startDate);
      if (endDate) dateFilter.orderDate.$lte = new Date(endDate);
    }

    const stats = await Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$total" },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
          },
          confirmedOrders: {
            $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] },
          },
          processingOrders: {
            $sum: { $cond: [{ $eq: ["$status", "processing"] }, 1, 0] },
          },
          shippedOrders: {
            $sum: { $cond: [{ $eq: ["$status", "shipped"] }, 1, 0] },
          },
          deliveredOrders: {
            $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] },
          },
          cancelledOrders: {
            $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
          },
        },
      },
    ]);

    const result = stats[0] || {
      totalOrders: 0,
      totalRevenue: 0,
      pendingOrders: 0,
      confirmedOrders: 0,
      processingOrders: 0,
      shippedOrders: 0,
      deliveredOrders: 0,
      cancelledOrders: 0,
    };

    res.status(200).json({
      total: result.totalOrders,
      pending: result.pendingOrders,
      confirmed: result.confirmedOrders,
      processing: result.processingOrders,
      shipped: result.shippedOrders,
      delivered: result.deliveredOrders,
      cancelled: result.cancelledOrders,
      revenue: result.totalRevenue,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single order details for admin
export const getOrderDetails = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("customer", "firstName lastName email phone")
      .populate("items.product", "name images price")
      .populate("vendors.vendor", "username email phone");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update order status (admin only)
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes, trackingNumber } = req.body;

    const validStatuses = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const oldStatus = order.status;
    order.status = status;

    // Update timestamps based on status
    const now = new Date();
    switch (status) {
      case "confirmed":
        order.confirmedDate = now;
        break;
      case "shipped":
        order.shippedDate = now;
        order.trackingNumber = trackingNumber || order.trackingNumber;
        break;
      case "delivered":
        order.deliveredDate = now;
        order.actualDelivery = now;
        break;
      case "cancelled":
        order.cancellationDate = now;
        order.cancellationReason = adminNotes || "Cancelled by admin";
        break;
    }

    if (adminNotes) {
      order.adminNotes = adminNotes;
    }

    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }

    await order.save();

    res.status(200).json({
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
