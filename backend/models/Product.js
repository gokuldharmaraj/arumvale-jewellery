import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      maxlength: 2000,
    },
    category: {
      type: String,
      required: [true, "Product category is required"],
      enum: [
        "Necklace",
        "Ring",
        "Bangle",
        "Earrings",
        "Pendant",
        "Anklet",
        "Chain",
        "Bracelet",
      ],
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: 0,
    },
    comparePrice: {
      type: Number,
      min: 0,
    },
    weight: {
      type: Number,
      required: [true, "Product weight is required"],
      min: 0,
    },
    purity: {
      type: String,
      required: [true, "Gold purity is required"],
      enum: ["24K", "22K", "18K", "14K", "925 Silver", "Platinum"],
    },
    stock: {
      type: Number,
      required: [true, "Stock quantity is required"],
      min: 0,
      default: 0,
    },
    hallmark: {
      type: String,
      trim: true,
    },
    sku: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    images: [
      {
        type: String,
        required: true,
      },
    ],
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "active"],
      default: "draft",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    // Custom product fields
    isCustom: {
      type: Boolean,
      default: false,
    },
    customForCustomer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    customRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CustomRequest",
    },
    // Rating fields
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

// Index for better query performance
productSchema.index({ vendor: 1, status: 1 });
productSchema.index({ category: 1 });
productSchema.index({ name: "text", description: "text" });

const Product = mongoose.model("Product", productSchema);
export default Product;
