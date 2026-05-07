import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    // Customer information
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Order items
    items: [orderItemSchema],

    // Order totals
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    tax: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    shipping: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    discount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },

    // Shipping information
    shippingAddress: {
      fullName: {
        type: String,
        required: true,
        trim: true,
      },
      phone: {
        type: String,
        required: true,
        trim: true,
      },
      address: {
        type: String,
        required: true,
        trim: true,
      },
      city: {
        type: String,
        required: true,
        trim: true,
      },
      state: {
        type: String,
        required: true,
        trim: true,
      },
      pincode: {
        type: String,
        required: true,
        trim: true,
      },
      country: {
        type: String,
        default: "India",
      },
    },

    // Billing information
    billingAddress: {
      fullName: {
        type: String,
        required: true,
        trim: true,
      },
      phone: {
        type: String,
        required: true,
        trim: true,
      },
      address: {
        type: String,
        required: true,
        trim: true,
      },
      city: {
        type: String,
        required: true,
        trim: true,
      },
      state: {
        type: String,
        required: true,
        trim: true,
      },
      pincode: {
        type: String,
        required: true,
        trim: true,
      },
      country: {
        type: String,
        default: "India",
      },
    },

    // Order status
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
      ],
      default: "pending",
    },

    // Payment information
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "card", "upi", "netbanking"],
      required: true,
    },
    paymentId: {
      type: String,
      trim: true,
    },

    // Tracking information
    trackingNumber: {
      type: String,
      trim: true,
    },
    estimatedDelivery: {
      type: Date,
    },
    actualDelivery: {
      type: Date,
    },

    // Notes and additional information
    orderNotes: {
      type: String,
      trim: true,
    },
    adminNotes: {
      type: String,
      trim: true,
    },

    // Cancellation information
    cancellationReason: {
      type: String,
      trim: true,
    },
    cancellationDate: {
      type: Date,
    },

    // Refund information
    refundReason: {
      type: String,
      trim: true,
    },
    refundAmount: {
      type: Number,
      min: 0,
    },
    refundDate: {
      type: Date,
    },

    // Vendor information (for multi-vendor orders)
    vendors: [
      {
        vendor: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        items: [orderItemSchema],
        subtotal: {
          type: Number,
          required: true,
          min: 0,
        },
        status: {
          type: String,
          enum: [
            "pending",
            "confirmed",
            "processing",
            "shipped",
            "delivered",
            "cancelled",
            "refunded",
          ],
          default: "pending",
        },
        trackingNumber: {
          type: String,
          trim: true,
        },
      },
    ],

    // Order timestamps
    orderDate: {
      type: Date,
      default: Date.now,
    },
    confirmedDate: {
      type: Date,
    },
    shippedDate: {
      type: Date,
    },
    deliveredDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for better query performance
orderSchema.index({ customer: 1, orderDate: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ "vendors.vendor": 1 });
orderSchema.index({ orderDate: -1 });

// Virtual for order number
orderSchema.virtual("orderNumber").get(function () {
  return `ORD${this._id.toString().slice(-8).toUpperCase()}`;
});

// Method to calculate order totals
orderSchema.methods.calculateTotals = function () {
  this.subtotal = this.items.reduce((total, item) => total + item.total, 0);
  this.total = this.subtotal + this.tax + this.shipping - this.discount;

  // Calculate vendor totals
  if (this.vendors && this.vendors.length > 0) {
    this.vendors.forEach((vendor) => {
      vendor.subtotal = vendor.items.reduce(
        (total, item) => total + item.total,
        0,
      );
    });
  }

  return this;
};

// Pre-save middleware to calculate totals
orderSchema.pre("save", async function () {
  if (
    this.isModified("items") ||
    this.isModified("tax") ||
    this.isModified("shipping") ||
    this.isModified("discount")
  ) {
    this.calculateTotals();
  }
});

const Order = mongoose.model("Order", orderSchema);

export default Order;
