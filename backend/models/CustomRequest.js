import mongoose from "mongoose";

const customRequestSchema = new mongoose.Schema(
  {
    // Core references
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Request details
    title: {
      type: String,
      required: [true, "Request title is required"],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, "Request description is required"],
      trim: true,
      maxlength: 2000,
    },
    designImage: {
      type: String,
      required: [true, "Design image is required"],
      trim: true,
    },

    // Workflow status
    status: {
      type: String,
      enum: [
        "pending",
        "under_review",
        "estimated",
        "approved",
        "rejected",
        "converted",
        "ordered",
      ],
      default: "pending",
    },

    // Vendor estimate
    estimate: {
      price: {
        type: Number,
        min: 0,
      },
      timeline: {
        type: String,
        trim: true,
      },
      notes: {
        type: String,
        trim: true,
        maxlength: 1000,
      },
      estimatedAt: {
        type: Date,
      },
    },

    // Customer response
    customerResponse: {
      decision: {
        type: String,
        enum: ["approved", "rejected"],
      },
      notes: {
        type: String,
        trim: true,
        maxlength: 1000,
      },
      respondedAt: {
        type: Date,
      },
    },

    // Conversion reference
    convertedProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
customRequestSchema.index({ customer: 1, status: 1 });
customRequestSchema.index({ vendor: 1, status: 1 });
customRequestSchema.index({ status: 1 });
customRequestSchema.index({ createdAt: -1 });

const CustomRequest = mongoose.model("CustomRequest", customRequestSchema);

export default CustomRequest;
