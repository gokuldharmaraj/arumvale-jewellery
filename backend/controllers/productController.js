import Product from "../models/Product.js";
import CustomRequest from "../models/CustomRequest.js";

// Create a new product (approved vendors only)
export const createProduct = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILES:", req.files);

    // Extract form fields from FormData
    const {
      name,
      description,
      category,
      price,
      comparePrice,
      weight,
      purity,
      stock,
      hallmark,
      sku,
      tags,
      status,
    } = req.body || {};

    // Validate required fields
    if (
      !name ||
      !description ||
      !category ||
      !price ||
      !weight ||
      !purity ||
      !stock
    ) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    // Check if SKU is unique (if provided)
    if (sku) {
      const existingProduct = await Product.findOne({ sku });
      if (existingProduct) {
        return res.status(400).json({ message: "SKU already exists" });
      }
    }

    // Process images from uploaded files
    const vendorId = req.user ? req.user._id : "temp";
    const images = req.files
      ? req.files.map(
          (file) => `/uploads/products/${vendorId}/${file.filename}`,
        )
      : [];

    if (images.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one product image is required" });
    }

    const product = await Product.create({
      name,
      description,
      category,
      price,
      comparePrice,
      weight,
      purity,
      stock,
      hallmark,
      sku,
      tags: tags
        ? tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag)
        : [],
      images,
      vendor: req.user._id,
      status,
    });

    const populatedProduct = await Product.findById(product._id).populate(
      "vendor",
      "username email",
    );

    res.status(201).json({
      message: "Product created successfully",
      product: populatedProduct,
    });
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get all products (public access)
export const getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      minPrice,
      maxPrice,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter
    let filter = {
      isDeleted: false,
      status: "active", // Only show active products to public
    };

    if (category) {
      filter.category = category;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    if (search) {
      filter.$text = { $search: search };
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const products = await Product.find(filter)
      .populate("vendor", "username")
      .sort(sort)
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

// Get single product by ID
export const getProduct = async (req, res) => {
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

// Update a product (vendor only, can only update own products)
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product || product.isDeleted) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if user owns the product or is admin
    if (
      product.vendor.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this product" });
    }

    const {
      name,
      description,
      category,
      price,
      comparePrice,
      weight,
      purity,
      stock,
      hallmark,
      sku,
      tags,
      status,
    } = req.body;

    // Check if SKU is unique (if provided and changed)
    if (sku && sku !== product.sku) {
      const existingProduct = await Product.findOne({
        sku,
        _id: { $ne: product._id },
      });
      if (existingProduct) {
        return res.status(400).json({ message: "SKU already exists" });
      }
    }

    // Update product fields
    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (category) updateData.category = category;
    if (price !== undefined) updateData.price = price;
    if (comparePrice !== undefined) updateData.comparePrice = comparePrice;
    if (weight !== undefined) updateData.weight = weight;
    if (purity) updateData.purity = purity;
    if (stock !== undefined) updateData.stock = stock;
    if (hallmark !== undefined) updateData.hallmark = hallmark;
    if (sku !== undefined) updateData.sku = sku;
    if (tags !== undefined)
      updateData.tags = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag);
    if (status !== undefined) updateData.status = status;

    // Process new images if uploaded
    if (req.files && req.files.length > 0) {
      const vendorId = req.user ? req.user._id : "temp";
      const newImages = req.files.map(
        (file) => `/uploads/products/${vendorId}/${file.filename}`,
      );
      updateData.images = [...product.images, ...newImages];
    }

    // Publish-time image cleanup for converted custom products
    if (status === "active" && product.isCustom && product.customRequestId) {
      try {
        // Load original CustomRequest to get designImage
        const customRequest = await CustomRequest.findById(
          product.customRequestId,
        );
        if (!customRequest) {
          return res.status(400).json({
            message: "Original custom request not found.",
          });
        }

        // Get current images (including any newly uploaded ones)
        const currentImages = updateData.images || product.images;

        // Remove designImage from product images
        const filteredImages = currentImages.filter(
          (image) => image !== customRequest.designImage,
        );

        // Update images in updateData
        updateData.images = filteredImages;

        // Block publish if no images remain after cleanup
        if (filteredImages.length === 0) {
          return res.status(400).json({
            message: "Upload actual product photos before publishing.",
          });
        }
      } catch (error) {
        return res.status(500).json({
          message: "Error processing custom request images.",
        });
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      product._id,
      updateData,
      { returnDocument: "after", runValidators: true },
    ).populate("vendor", "username email");

    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a product (vendor only, can only delete own products)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product || product.isDeleted) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if user owns the product or is admin
    if (
      product.vendor.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this product" });
    }

    // Soft delete
    product.isDeleted = true;
    await product.save();

    res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get current vendor's products (approved vendors only)
export const getVendorProducts = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const { page = 1, limit = 10, status, category, search } = req.query;

    // Build filter
    let filter = {
      vendor: req.user._id,
      isDeleted: false,
    };

    if (status) {
      filter.status = status;
    }

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.$text = { $search: search };
    }

    const products = await Product.find(filter)
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

// Remove product image
export const removeProductImage = async (req, res) => {
  try {
    const { Id, imageUrl } = req.params;

    const product = await Product.findById(Id);

    if (!product || product.isDeleted) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if user owns the product or is admin
    if (
      product.vendor.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this product" });
    }

    // Remove image from array
    product.images = product.images.filter((img) => img !== imageUrl);

    if (product.images.length === 0) {
      return res
        .status(400)
        .json({ message: "Product must have at least one image" });
    }

    await product.save();

    res.status(200).json({
      message: "Image removed successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
