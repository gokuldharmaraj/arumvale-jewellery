import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Shop Information
    shopName: {
      type: String,
      required: [true, "Please add shop name"],
      trim: true,
    },
    shopType: {
      type: String,
      enum: ["retail", "wholesale", "manufacturer", "online"],
      required: [true, "Please select shop type"],
    },
    yearsInBusiness: {
      type: String,
      enum: ["0-1", "1-5", "5-10", "10-20", "20+"],
    },
    website: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },

    // Business Documents
    gstNumber: {
      type: String,
      required: [true, "Please add GST number"],
      trim: true,
      match: [
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
        "Please add a valid GST number",
      ],
    },
    panNumber: {
      type: String,
      required: [true, "Please add PAN number"],
      trim: true,
      match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Please add a valid PAN number"],
    },
    bisHallmark: {
      type: String,
      trim: true,
    },

    // Bank Details
    bankName: {
      type: String,
      required: [true, "Please add bank name"],
      trim: true,
    },
    accountNumber: {
      type: String,
      required: [true, "Please add account number"],
      trim: true,
    },
    ifscCode: {
      type: String,
      required: [true, "Please add IFSC code"],
      trim: true,
      match: [/^[A-Z]{4}0[A-Z0-9]{6}$/, "Please add a valid IFSC code"],
    },

    // Verification Status
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationDate: {
      type: Date,
    },
    verificationDocuments: [
      {
        type: String, // URLs to uploaded documents
      },
    ],

    // Business Performance
    totalProducts: {
      type: Number,
      default: 0,
    },
    totalSales: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },

    // Shop Status
    isActive: {
      type: Boolean,
      default: true,
    },
    suspensionReason: {
      type: String,
      default: null,
    },
    suspensionDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

// Index for efficient queries
vendorSchema.index({ user: 1 }, { unique: true });
vendorSchema.index({ shopName: 1 });
vendorSchema.index({ gstNumber: 1 });
vendorSchema.index({ panNumber: 1 });

const Vendor = mongoose.model("Vendor", vendorSchema);

export default Vendor;
