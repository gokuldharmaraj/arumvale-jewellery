import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import CustomRequest from "../models/CustomRequest.js";

// Create a new order from cart
export const createOrder = async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      billingAddress,
      paymentMethod,
      orderNotes,
    } = req.body;

    // Validate required fields
    if (!items || items.length === 0) {
      return res
        .status(400)
        .json({ message: "Order must contain at least one item" });
    }

    if (!shippingAddress || !billingAddress) {
      return res
        .status(400)
        .json({ message: "Shipping and billing addresses are required" });
    }

    if (!paymentMethod) {
      return res.status(400).json({ message: "Payment method is required" });
    }

    // Validate items and check stock
    const orderItems = [];
    const vendorsMap = new Map(); // To group items by vendor

    for (const item of items) {
      const product = await Product.findById(item.product);

      if (!product || product.isDeleted) {
        return res
          .status(404)
          .json({ message: `Product ${item.product} not found` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`,
        });
      }

      // Check custom product ownership
      if (product.isCustom === true) {
        if (
          !product.customForCustomer ||
          product.customForCustomer.toString() !== req.user._id.toString()
        ) {
          return res.status(403).json({
            message: "Not authorized to purchase this custom product",
          });
        }
      }

      const itemTotal = product.price * item.quantity;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
        total: itemTotal,
      });

      // Group items by vendor
      if (!vendorsMap.has(product.vendor.toString())) {
        vendorsMap.set(product.vendor.toString(), {
          vendor: product.vendor,
          items: [],
          subtotal: 0,
        });
      }

      const vendorData = vendorsMap.get(product.vendor.toString());
      vendorData.items.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
        total: itemTotal,
      });
      vendorData.subtotal += itemTotal;
    }

    // Calculate order totals
    const subtotal = orderItems.reduce((total, item) => total + item.total, 0);
    const tax = subtotal * 0.03; // 3% tax
    const shipping = subtotal > 1000 ? 0 : 50; // Free shipping over 1000
    const total = subtotal + tax + shipping;

    // Create order
    const order = new Order({
      customer: req.user._id,
      items: orderItems,
      subtotal,
      tax,
      shipping,
      total,
      shippingAddress,
      billingAddress,
      paymentMethod,
      orderNotes,
      vendors: Array.from(vendorsMap.values()),
    });

    // Update product stock and custom requests
    for (const item of items) {
      const product = await Product.findById(item.product);

      // Update stock
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });

      // Update custom request status if it's a custom product
      if (product.isCustom === true && product.customRequestId) {
        await CustomRequest.findByIdAndUpdate(product.customRequestId, {
          status: "ordered",
        });
      }
    }

    // Clear user's cart
    await User.findByIdAndUpdate(req.user._id, {
      $set: { cart: [] },
    });

    await order.save();

    // Populate order details for response
    const populatedOrder = await Order.findById(order._id)
      .populate("customer", "firstName lastName email phone")
      .populate("items.product", "name images description")
      .populate("vendors.vendor", "shopName email phone");

    // Convert to object and add virtual fields
    const orderObject = populatedOrder.toObject();
    orderObject.orderNumber = `ORD${populatedOrder._id.toString().slice(-8).toUpperCase()}`;

    res.status(201).json({
      message: "Order created successfully",
      order: orderObject,
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get all orders (for admin)
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
      .populate("items.product", "name images description")
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

// Get current user's orders
export const getUserOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      sortBy = "orderDate",
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

    const orders = await Order.find(filter)
      .populate("items.product", "name images description")
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Add orderNumber virtual field to each order
    const ordersWithNumbers = orders.map((order) => {
      const orderObject = order.toObject();
      orderObject.orderNumber = `ORD${order._id.toString().slice(-8).toUpperCase()}`;
      return orderObject;
    });

    const total = await Order.countDocuments(filter);

    res.status(200).json({
      orders: ordersWithNumbers,
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

// Get vendor's orders
export const getVendorOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      sortBy = "orderDate",
      sortOrder = "desc",
    } = req.query;

    // Build filter
    let filter = { "vendors.vendor": req.user._id };

    if (status) {
      filter["vendors.status"] = status;
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const orders = await Order.find(filter)
      .populate("customer", "firstName lastName email phone")
      .populate("items.product", "name images description")
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Filter orders to only show items from this vendor
    const vendorOrders = orders
      .map((order) => {
        const vendorData = order.vendors.find(
          (v) => v.vendor.toString() === req.user._id.toString(),
        );
        if (vendorData) {
          const vendorItems = order.items.filter((item) => {
            return vendorData.items.some(
              (vItem) =>
                vItem.product.toString() === item.product._id.toString(),
            );
          });

          return {
            ...order.toObject(),
            items: vendorItems,
            vendorStatus: vendorData.status,
            vendorTrackingNumber: vendorData.trackingNumber,
          };
        }
        return null;
      })
      .filter((order) => order !== null);

    const total = await Order.countDocuments(filter);

    res.status(200).json({
      orders: vendorOrders,
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

// Get single order by ID
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("customer", "firstName lastName email phone")
      .populate("items.product", "name images description")
      .populate("vendors.vendor", "shopName email phone");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user is authorized to view this order
    const isCustomer =
      order.customer._id.toString() === req.user._id.toString();
    const isVendor = order.vendors.some(
      (v) => v.vendor._id.toString() === req.user._id.toString(),
    );
    const isAdmin = req.user.role === "admin";

    if (!isCustomer && !isVendor && !isAdmin) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this order" });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update order status (for admin and vendor)
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const order = await Order.findById(id).populate("vendors.vendor");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const isAdmin = req.user.role === "admin";
    const isVendor = order.vendors.some(
      (v) => v.vendor._id.toString() === req.user._id.toString(),
    );

    if (!isAdmin && !isVendor) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this order" });
    }

    // Validate status transitions
    const validTransitions = {
      pending: ["confirmed", "cancelled"],
      confirmed: ["processing", "cancelled"],
      processing: ["shipped", "cancelled"],
      shipped: ["delivered"],
      delivered: ["refunded"],
      cancelled: [],
      refunded: [],
    };

    if (!validTransitions[order.status].includes(status)) {
      return res.status(400).json({
        message: `Cannot change order status from ${order.status} to ${status}`,
      });
    }

    // Update order status
    order.status = status;

    // Update timestamps
    const now = new Date();
    switch (status) {
      case "confirmed":
        order.confirmedDate = now;
        break;
      case "shipped":
        order.shippedDate = now;
        break;
      case "delivered":
        order.deliveredDate = now;
        order.actualDelivery = now;
        break;
      case "cancelled":
        order.cancellationDate = now;
        order.cancellationReason = adminNotes || "Cancelled by admin/vendor";
        // Restore stock
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: item.quantity },
          });
        }
        break;
    }

    if (adminNotes) {
      order.adminNotes = adminNotes;
    }

    // If vendor is updating, update vendor-specific status
    if (isVendor) {
      const vendorIndex = order.vendors.findIndex(
        (v) => v.vendor._id.toString() === req.user._id.toString(),
      );
      if (vendorIndex !== -1) {
        order.vendors[vendorIndex].status = status;
      }
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

// Update payment status (for admin)
export const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus, paymentId } = req.body;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.paymentStatus = paymentStatus;
    if (paymentId) {
      order.paymentId = paymentId;
    }

    await order.save();

    res.status(200).json({
      message: "Payment status updated successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cancel order (for customer)
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user owns this order
    if (order.customer.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to cancel this order" });
    }

    // Check if order can be cancelled
    if (!["pending", "confirmed"].includes(order.status)) {
      return res.status(400).json({
        message: "Order cannot be cancelled at this stage",
      });
    }

    order.status = "cancelled";
    order.cancellationDate = new Date();
    order.cancellationReason = reason || "Cancelled by customer";

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }

    await order.save();

    res.status(200).json({
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get order statistics (for admin)
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
          paidOrders: {
            $sum: { $cond: [{ $eq: ["$paymentStatus", "paid"] }, 1, 0] },
          },
          unpaidOrders: {
            $sum: { $cond: [{ $eq: ["$paymentStatus", "pending"] }, 1, 0] },
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
      paidOrders: 0,
      unpaidOrders: 0,
    };

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
