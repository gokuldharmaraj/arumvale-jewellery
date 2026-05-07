import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import Vendor from "../models/Vendor.js";
import Review from "../models/Review.js";

// Get overall dashboard analytics (for admin)
export const getDashboardAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.orderDate = {};
      if (startDate) dateFilter.orderDate.$gte = new Date(startDate);
      if (endDate) dateFilter.orderDate.$lte = new Date(endDate);
    }

    // Get order statistics
    const orderStats = await Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$total" },
          averageOrderValue: { $avg: "$total" },
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

    // Get product statistics
    const productStats = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          activeProducts: {
            $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] },
          },
          draftProducts: {
            $sum: { $cond: [{ $eq: ["$status", "draft"] }, 1, 0] },
          },
          outOfStockProducts: {
            $sum: { $cond: [{ $eq: ["$stock", 0] }, 1, 0] },
          },
          averagePrice: { $avg: "$price" },
          totalStockValue: { $sum: { $multiply: ["$price", "$stock"] } },
        },
      },
    ]);

    // Get user statistics
    const userStats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          customers: {
            $sum: { $cond: [{ $eq: ["$role", "user"] }, 1, 0] },
          },
          vendors: {
            $sum: { $cond: [{ $eq: ["$role", "vendor"] }, 1, 0] },
          },
          admins: {
            $sum: { $cond: [{ $eq: ["$role", "admin"] }, 1, 0] },
          },
          approvedVendors: {
            $sum: { $cond: [{ $eq: ["$isApproved", true] }, 1, 0] },
          },
        },
      },
    ]);

    // Get review statistics
    const reviewStats = await Review.aggregate([
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageRating: { $avg: "$rating" },
          pendingReviews: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
          },
          approvedReviews: {
            $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] },
          },
        },
      },
    ]);

    // Get sales over time (last 30 days)
    const salesOverTime = await Order.aggregate([
      {
        $match: {
          orderDate: {
            $gte: new Date(new Date().setDate(new Date().getDate() - 30)),
          },
          status: { $in: ["delivered"] },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$orderDate" } },
          dailyRevenue: { $sum: "$total" },
          dailyOrders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Get top selling products
    const topProducts = await Order.aggregate([
      { $unwind: "$items" },
      { $match: { status: "delivered" } },
      {
        $group: {
          _id: "$items.product",
          totalSold: { $sum: "$items.quantity" },
          totalRevenue: { $sum: "$items.total" },
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: "$productInfo" },
      {
        $project: {
          productName: "$productInfo.name",
          totalSold: 1,
          totalRevenue: 1,
          averagePrice: { $divide: ["$totalRevenue", "$totalSold"] },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 },
    ]);

    // Get top vendors by revenue
    const topVendors = await Order.aggregate([
      { $unwind: "$vendors" },
      { $match: { status: "delivered" } },
      {
        $group: {
          _id: "$vendors.vendor",
          totalRevenue: { $sum: "$vendors.subtotal" },
          totalOrders: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "vendors",
          localField: "_id",
          foreignField: "user",
          as: "vendorInfo",
        },
      },
      { $unwind: "$vendorInfo" },
      {
        $project: {
          shopName: "$vendorInfo.shopName",
          totalRevenue: 1,
          totalOrders: 1,
          averageOrderValue: { $divide: ["$totalRevenue", "$totalOrders"] },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 },
    ]);

    const result = {
      orders: orderStats[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        pendingOrders: 0,
        confirmedOrders: 0,
        processingOrders: 0,
        shippedOrders: 0,
        deliveredOrders: 0,
        cancelledOrders: 0,
      },
      products: productStats[0] || {
        totalProducts: 0,
        activeProducts: 0,
        draftProducts: 0,
        outOfStockProducts: 0,
        averagePrice: 0,
        totalStockValue: 0,
      },
      users: userStats[0] || {
        totalUsers: 0,
        customers: 0,
        vendors: 0,
        admins: 0,
        approvedVendors: 0,
      },
      reviews: reviewStats[0] || {
        totalReviews: 0,
        averageRating: 0,
        pendingReviews: 0,
        approvedReviews: 0,
      },
      salesOverTime,
      topProducts,
      topVendors,
    };

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get vendor analytics
export const getVendorAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.orderDate = {};
      if (startDate) dateFilter.orderDate.$gte = new Date(startDate);
      if (endDate) dateFilter.orderDate.$lte = new Date(endDate);
    }

    // Get vendor's order statistics
    const orderStats = await Order.aggregate([
      { $unwind: "$vendors" },
      {
        $match: {
          "vendors.vendor": new mongoose.Types.ObjectId(req.user._id),
          ...dateFilter,
        },
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$vendors.subtotal" },
          averageOrderValue: { $avg: "$vendors.subtotal" },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ["$vendors.status", "pending"] }, 1, 0] },
          },
          confirmedOrders: {
            $sum: { $cond: [{ $eq: ["$vendors.status", "confirmed"] }, 1, 0] },
          },
          processingOrders: {
            $sum: { $cond: [{ $eq: ["$vendors.status", "processing"] }, 1, 0] },
          },
          shippedOrders: {
            $sum: { $cond: [{ $eq: ["$vendors.status", "shipped"] }, 1, 0] },
          },
          deliveredOrders: {
            $sum: { $cond: [{ $eq: ["$vendors.status", "delivered"] }, 1, 0] },
          },
          cancelledOrders: {
            $sum: { $cond: [{ $eq: ["$vendors.status", "cancelled"] }, 1, 0] },
          },
        },
      },
    ]);

    // Get vendor's product statistics
    const productStats = await Product.aggregate([
      { $match: { vendor: new mongoose.Types.ObjectId(req.user._id) } },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          activeProducts: {
            $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] },
          },
          draftProducts: {
            $sum: { $cond: [{ $eq: ["$status", "draft"] }, 1, 0] },
          },
          outOfStockProducts: {
            $sum: { $cond: [{ $eq: ["$stock", 0] }, 1, 0] },
          },
          averagePrice: { $avg: "$price" },
          totalStockValue: { $sum: { $multiply: ["$price", "$stock"] } },
        },
      },
    ]);

    // Get vendor's review statistics
    const reviewStats = await Review.calculateVendorRating(req.user._id);

    // Get sales over time (last 30 days)
    const salesOverTime = await Order.aggregate([
      { $unwind: "$vendors" },
      {
        $match: {
          "vendors.vendor": new mongoose.Types.ObjectId(req.user._id),
          "vendors.status": "delivered",
          orderDate: {
            $gte: new Date(new Date().setDate(new Date().getDate() - 30)),
          },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$orderDate" } },
          dailyRevenue: { $sum: "$vendors.subtotal" },
          dailyOrders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Get top selling products for this vendor
    const topProducts = await Order.aggregate([
      { $unwind: "$items" },
      { $unwind: "$vendors" },
      {
        $match: {
          "vendors.vendor": new mongoose.Types.ObjectId(req.user._id),
          status: "delivered",
        },
      },
      {
        $group: {
          _id: "$items.product",
          totalSold: { $sum: "$items.quantity" },
          totalRevenue: { $sum: "$items.total" },
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: "$productInfo" },
      {
        $project: {
          productName: "$productInfo.name",
          totalSold: 1,
          totalRevenue: 1,
          averagePrice: { $divide: ["$totalRevenue", "$totalSold"] },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 },
    ]);

    const result = {
      orders: orderStats[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        pendingOrders: 0,
        confirmedOrders: 0,
        processingOrders: 0,
        shippedOrders: 0,
        deliveredOrders: 0,
        cancelledOrders: 0,
      },
      products: productStats[0] || {
        totalProducts: 0,
        activeProducts: 0,
        draftProducts: 0,
        outOfStockProducts: 0,
        averagePrice: 0,
        totalStockValue: 0,
      },
      reviews: reviewStats,
      salesOverTime,
      topProducts,
    };

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get sales report (for admin)
export const getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = "day" } = req.query;

    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.orderDate = {};
      if (startDate) dateFilter.orderDate.$gte = new Date(startDate);
      if (endDate) dateFilter.orderDate.$lte = new Date(endDate);
    }

    let groupFormat;
    switch (groupBy) {
      case "hour":
        groupFormat = "%Y-%m-%d %H";
        break;
      case "day":
        groupFormat = "%Y-%m-%d";
        break;
      case "week":
        groupFormat = "%Y-%U";
        break;
      case "month":
        groupFormat = "%Y-%m";
        break;
      case "year":
        groupFormat = "%Y";
        break;
      default:
        groupFormat = "%Y-%m-%d";
    }

    const salesData = await Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: { $dateToString: { format: groupFormat, date: "$orderDate" } },
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$total" },
          averageOrderValue: { $avg: "$total" },
          uniqueCustomers: { $addToSet: "$customer" },
        },
      },
      {
        $project: {
          period: "$_id",
          totalOrders: 1,
          totalRevenue: 1,
          averageOrderValue: 1,
          uniqueCustomers: { $size: "$uniqueCustomers" },
        },
      },
      { $sort: { period: 1 } },
    ]);

    res.status(200).json({
      salesData,
      groupBy,
      period: { startDate, endDate },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get inventory report (for admin)
export const getInventoryReport = async (req, res) => {
  try {
    const { category, vendor, lowStock = 10 } = req.query;

    let filter = {};
    if (category) filter.category = category;
    if (vendor) filter.vendor = new mongoose.Types.ObjectId(vendor);

    const inventoryData = await Product.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: "vendors",
          localField: "vendor",
          foreignField: "user",
          as: "vendorInfo",
        },
      },
      { $unwind: "$vendorInfo" },
      {
        $project: {
          name: 1,
          category: 1,
          price: 1,
          stock: 1,
          status: 1,
          sku: 1,
          vendorName: "$vendorInfo.shopName",
          totalValue: { $multiply: ["$price", "$stock"] },
          isLowStock: { $lte: ["$stock", parseInt(lowStock)] },
        },
      },
      { $sort: { stock: 1 } },
    ]);

    const summary = await Product.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalStockValue: { $sum: { $multiply: ["$price", "$stock"] } },
          lowStockProducts: {
            $sum: { $cond: [{ $lte: ["$stock", parseInt(lowStock)] }, 1, 0] },
          },
          outOfStockProducts: {
            $sum: { $cond: [{ $eq: ["$stock", 0] }, 1, 0] },
          },
        },
      },
    ]);

    res.status(200).json({
      inventory: inventoryData,
      summary: summary[0] || {
        totalProducts: 0,
        totalStockValue: 0,
        lowStockProducts: 0,
        outOfStockProducts: 0,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get customer analytics
export const getCustomerAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.orderDate = {};
      if (startDate) dateFilter.orderDate.$gte = new Date(startDate);
      if (endDate) dateFilter.orderDate.$lte = new Date(endDate);
    }

    // Get customer statistics
    const customerStats = await Order.aggregate([
      {
        $match: {
          customer: new mongoose.Types.ObjectId(req.user._id),
          ...dateFilter,
        },
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: "$total" },
          averageOrderValue: { $avg: "$total" },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
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

    // Get order history
    const orderHistory = await Order.find({
      customer: req.user._id,
      ...dateFilter,
    })
      .populate("items.product", "name images")
      .sort({ orderDate: -1 })
      .limit(10);

    // Get favorite categories
    const favoriteCategories = await Order.aggregate([
      { $match: { customer: new mongoose.Types.ObjectId(req.user._id) } },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: "$productInfo" },
      {
        $group: {
          _id: "$productInfo.category",
          count: { $sum: 1 },
          totalSpent: { $sum: "$items.total" },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    const result = {
      stats: customerStats[0] || {
        totalOrders: 0,
        totalSpent: 0,
        averageOrderValue: 0,
        pendingOrders: 0,
        deliveredOrders: 0,
        cancelledOrders: 0,
      },
      orderHistory,
      favoriteCategories,
    };

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
