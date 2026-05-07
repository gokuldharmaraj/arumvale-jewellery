import CustomRequest from "../models/CustomRequest.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Vendor from "../models/Vendor.js";

// Get current user's custom requests
export const getMyCustomRequests = async (req, res) => {
  try {
    const requests = await CustomRequest.find({ customer: req.user._id })
      .populate("vendor", "username firstName lastName")
      .sort({ createdAt: -1 });

    // Lookup vendor profiles to get shop names
    const vendorIds = requests.map((req) => req.vendor._id);
    const vendorProfiles = await Vendor.find({
      user: { $in: vendorIds },
    }).select("user shopName shopType");

    // Map vendor profiles to requests
    const requestsWithVendorInfo = requests.map((request) => {
      const vendorProfile = vendorProfiles.find(
        (vp) => vp.user.toString() === request.vendor._id.toString(),
      );
      return {
        ...request.toObject(),
        vendor: {
          ...(request.vendor && typeof request.vendor.toObject === "function"
            ? request.vendor.toObject()
            : request.vendor),
          shopName: vendorProfile?.shopName || "Unknown Vendor",
          shopType: vendorProfile?.shopType,
        },
      };
    });

    res.json(requestsWithVendorInfo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get current vendor's custom requests
export const getVendorCustomRequests = async (req, res) => {
  try {
    // Build query filter
    const filter = { vendor: req.user._id };

    // Add status filter if provided (supports both single and comma-separated)
    if (req.query.status) {
      const statuses = req.query.status.split(",").map((s) => s.trim());
      if (statuses.length === 1) {
        // Single status filter (preserves existing behavior)
        filter.status = statuses[0];
      } else {
        // Multi-status filter
        filter.status = { $in: statuses };
      }
    }

    const requests = await CustomRequest.find(filter)
      .populate("customer", "username firstName lastName")
      .populate("convertedProduct", "name status images _id")
      .sort({ createdAt: -1 });

    // Lookup vendor profiles to get shop names
    const vendorIds = requests.map((req) => req.vendor._id).filter(Boolean);
    const vendorProfiles =
      vendorIds.length > 0
        ? await Vendor.find({
            user: { $in: vendorIds },
          }).select("user shopName shopType")
        : [];

    // Map vendor profiles to requests
    const requestsWithVendorInfo = requests.map((request) => {
      const vendorProfile = vendorProfiles.find(
        (vp) => vp.user.toString() === request.vendor._id.toString(),
      );
      return {
        ...request.toObject(),
        vendor: {
          ...(request.vendor && typeof request.vendor.toObject === "function"
            ? request.vendor.toObject()
            : request.vendor),
          shopName: vendorProfile?.shopName || "Unknown Vendor",
          shopType: vendorProfile?.shopType,
        },
      };
    });

    res.json(requestsWithVendorInfo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new custom request (customers only)
export const createCustomRequest = async (req, res) => {
  try {
    const { vendor, title, description } = req.body;

    // Validate required fields
    if (!vendor || !title || !description) {
      return res.status(400).json({
        message: "Please provide vendor, title, and description",
      });
    }

    // Validate vendor exists and is approved
    const vendorUser = await User.findById(vendor);
    if (!vendorUser) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    if (vendorUser.role !== "vendor") {
      return res.status(400).json({ message: "Invalid vendor" });
    }

    if (!vendorUser.isApproved) {
      return res.status(400).json({ message: "Vendor is not approved" });
    }

    if (!vendorUser.isActive) {
      return res.status(400).json({ message: "Vendor account is inactive" });
    }

    // Validate design image was uploaded
    if (!req.file) {
      return res.status(400).json({ message: "Design image is required" });
    }

    // Construct design image path
    const designImage = `/uploads/custom-requests/${req.user._id}/${req.file.filename}`;

    // Create custom request
    const customRequest = await CustomRequest.create({
      customer: req.user._id,
      vendor,
      title,
      description,
      designImage,
      status: "pending",
    });

    // Populate vendor details for response
    const populatedRequest = await CustomRequest.findById(
      customRequest._id,
    ).populate("vendor", "username email");

    res.status(201).json({
      message: "Custom request submitted successfully",
      customRequest: populatedRequest,
    });
  } catch (error) {
    console.error("Create custom request error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Provide estimate for custom request (approved vendors only)
export const provideEstimate = async (req, res) => {
  try {
    const { price, timeline, notes } = req.body;

    // Validate required fields
    if (!price || !timeline) {
      return res.status(400).json({
        message: "Please provide price and timeline",
      });
    }

    // Get request
    const request = await CustomRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Custom request not found" });
    }

    // Validate vendor ownership
    if (request.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized to estimate this request",
      });
    }

    // Validate status for transition
    if (!["pending", "under_review"].includes(request.status)) {
      return res.status(400).json({
        message: `Cannot estimate request with status: ${request.status}`,
      });
    }

    // Prevent duplicate estimates
    if (request.status === "estimated") {
      return res.status(400).json({
        message: "Request already has an estimate",
      });
    }

    // Update request with estimate
    request.estimate = {
      price: parseFloat(price),
      timeline,
      notes,
      estimatedAt: new Date(),
    };
    request.status = "estimated";

    await request.save();

    // Populate for response
    const populatedRequest = await CustomRequest.findById(request._id).populate(
      "customer",
      "firstName lastName email",
    );

    res.status(200).json({
      message: "Estimate submitted successfully",
      customRequest: populatedRequest,
    });
  } catch (error) {
    console.error("Provide estimate error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Respond to estimate (customers only)
export const respondToEstimate = async (req, res) => {
  try {
    const { decision, notes } = req.body;

    // Validate decision
    if (!decision || !["approved", "rejected"].includes(decision)) {
      return res.status(400).json({
        message: "Decision must be 'approved' or 'rejected'",
      });
    }

    // Get request
    const request = await CustomRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Custom request not found" });
    }

    // Validate customer ownership
    if (request.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized to respond to this request",
      });
    }

    // Validate status for response
    if (request.status !== "estimated") {
      return res.status(400).json({
        message: `Cannot respond to request with status: ${request.status}`,
      });
    }

    // Prevent duplicate responses
    if (request.customerResponse && request.customerResponse.decision) {
      return res.status(400).json({
        message: "Response already recorded",
      });
    }

    // Update request with customer response
    request.customerResponse = {
      decision,
      notes,
      respondedAt: new Date(),
    };
    request.status = decision;

    await request.save();

    // Populate for response
    const populatedRequest = await CustomRequest.findById(request._id).populate(
      "vendor",
      "username email",
    );

    res.status(200).json({
      message: `Estimate ${decision} successfully`,
      customRequest: populatedRequest,
    });
  } catch (error) {
    console.error("Respond to estimate error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Convert approved request to custom product (approved vendors only)
export const convertToProduct = async (req, res) => {
  try {
    // Get request
    const request = await CustomRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Custom request not found" });
    }

    // Validate vendor ownership
    if (request.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized to convert this request",
      });
    }

    // Validate status for conversion
    if (request.status !== "approved") {
      return res.status(400).json({
        message: `Cannot convert request with status: ${request.status}`,
      });
    }

    // Prevent duplicate conversion
    if (request.convertedProduct) {
      return res.status(400).json({
        message: "Request already converted to product",
        convertedProduct: request.convertedProduct,
      });
    }

    // Detect mode: NEW MODE if any product fields present, LEGACY MODE otherwise
    const isNewMode =
      req.body &&
      (req.body.productName ||
        req.body.productDescription ||
        req.body.category ||
        req.body.purity ||
        req.body.weight ||
        req.body.stock ||
        req.body.price);

    let productData;

    if (isNewMode) {
      // NEW MODE: Use form data with strict validation
      const {
        productName,
        productDescription,
        category,
        purity,
        weight,
        stock,
        price,
      } = req.body;

      // Validation rules
      const errors = {};

      // Required fields validation
      if (!productName || !productName.trim()) {
        errors.productName = "Product name is required";
      }
      if (!productDescription || !productDescription.trim()) {
        errors.productDescription = "Product description is required";
      }
      if (!category) {
        errors.category = "Product category is required";
      }
      if (!purity) {
        errors.purity = "Product purity is required";
      }
      if (!weight || isNaN(weight) || parseFloat(weight) <= 0) {
        errors.weight = "Weight must be a positive number";
      }
      if (!stock || isNaN(stock) || parseInt(stock) < 1) {
        errors.stock = "Stock must be at least 1";
      }
      if (!price || isNaN(price) || parseFloat(price) <= 0) {
        errors.price = "Price must be a positive number";
      }

      // Enum validation for category
      const validCategories = [
        "Necklace",
        "Ring",
        "Bangle",
        "Earrings",
        "Pendant",
        "Anklet",
        "Chain",
        "Bracelet",
      ];
      if (category && !validCategories.includes(category)) {
        errors.category =
          "Invalid category. Must be one of: " + validCategories.join(", ");
      }

      // Enum validation for purity
      const validPurities = [
        "24K",
        "22K",
        "18K",
        "14K",
        "925 Silver",
        "Platinum",
      ];
      if (purity && !validPurities.includes(purity)) {
        errors.purity =
          "Invalid purity. Must be one of: " + validPurities.join(", ");
      }

      // Return validation errors if any
      if (Object.keys(errors).length > 0) {
        return res.status(400).json({
          message: "Validation failed",
          errors,
        });
      }

      // Create product with form data
      productData = {
        name: productName.trim(),
        description: productDescription.trim(),
        category,
        price: parseFloat(price),
        weight: parseFloat(weight),
        purity,
        stock: parseInt(stock),
        images: [request.designImage],
        vendor: request.vendor,
        status: "draft",
        isCustom: true,
        customForCustomer: request.customer,
        customRequestId: request._id,
      };
    } else {
      // LEGACY MODE: Use request data with safe fallbacks
      if (!request.estimate || !request.estimate.price) {
        return res.status(400).json({
          message:
            "Legacy mode requires request to have an approved estimate with price",
        });
      }

      // Infer category from title if possible, else use safe default
      let inferredCategory = "Pendant"; // Safe default
      const title = request.title.toLowerCase();
      if (title.includes("ring")) inferredCategory = "Ring";
      else if (title.includes("necklace")) inferredCategory = "Necklace";
      else if (title.includes("bangle")) inferredCategory = "Bangle";
      else if (title.includes("earring")) inferredCategory = "Earrings";
      else if (title.includes("anklet")) inferredCategory = "Anklet";
      else if (title.includes("chain")) inferredCategory = "Chain";
      else if (title.includes("bracelet")) inferredCategory = "Bracelet";

      // Create product with legacy data and minimal safe values
      productData = {
        name: request.title,
        description: request.description,
        category: inferredCategory,
        price: request.estimate.price,
        weight: 1, // Minimal safe weight instead of 0
        purity: "22K", // Fallback purity
        stock: 1, // Default stock
        images: [request.designImage],
        vendor: request.vendor,
        status: "draft",
        isCustom: true,
        customForCustomer: request.customer,
        customRequestId: request._id,
      };
    }

    // Create product
    const product = await Product.create(productData);

    // Update request with product reference
    request.convertedProduct = product._id;
    request.status = "converted";
    await request.save();

    // Populate for response
    const populatedProduct = await Product.findById(product._id).populate(
      "vendor",
      "username email",
    );

    res.status(201).json({
      message: "Custom request converted to product successfully",
      product: populatedProduct,
    });
  } catch (error) {
    console.error("Convert to product error:", error);
    res.status(500).json({ message: error.message });
  }
};
