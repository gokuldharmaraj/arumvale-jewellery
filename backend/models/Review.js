import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  // Customer who wrote the review
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  
  // Product being reviewed
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  
  // Order reference (to ensure only verified purchases can review)
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  
  // Rating (1-5 stars)
  rating: {
    type: Number,
    required: [true, "Rating is required"],
    min: 1,
    max: 5,
    validate: {
      validator: Number.isInteger,
      message: "Rating must be an integer between 1 and 5"
    }
  },
  
  // Review title
  title: {
    type: String,
    required: [true, "Review title is required"],
    trim: true,
    maxlength: 100,
  },
  
  // Review content
  content: {
    type: String,
    required: [true, "Review content is required"],
    trim: true,
    minlength: 10,
    maxlength: 2000,
  },
  
  // Review images (optional)
  images: [{
    type: String,
    trim: true,
  }],
  
  // Helpful votes
  helpful: {
    type: Number,
    default: 0,
    min: 0,
  },
  
  // Not helpful votes
  notHelpful: {
    type: Number,
    default: 0,
    min: 0,
  },
  
  // Verified purchase flag
  isVerifiedPurchase: {
    type: Boolean,
    default: true,
  },
  
  // Review status
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "hidden"],
    default: "pending",
  },
  
  // Admin notes for rejected reviews
  adminNotes: {
    type: String,
    trim: true,
  },
  
  // Response from vendor
  vendorResponse: {
    content: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    respondedAt: {
      type: Date,
    },
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  
  // Review timestamps
  reviewDate: {
    type: Date,
    default: Date.now,
  },
  approvedDate: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Indexes for better query performance
reviewSchema.index({ product: 1, status: 1 });
reviewSchema.index({ customer: 1, product: 1 });
reviewSchema.index({ order: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ reviewDate: -1 });

// Compound index to prevent duplicate reviews
reviewSchema.index({ customer: 1, product: 1, order: 1 }, { unique: true });

// Virtual for review ID
reviewSchema.virtual('reviewId').get(function() {
  return `RV${this._id.toString().slice(-8).toUpperCase()}`;
});

// Pre-save middleware to set approved date
reviewSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'approved' && !this.approvedDate) {
    this.approvedDate = new Date();
  }
  next();
});

// Static method to calculate product rating
reviewSchema.statics.calculateProductRating = async function(productId) {
  const stats = await this.aggregate([
    {
      $match: {
        product: new mongoose.Types.ObjectId(productId),
        status: 'approved'
      }
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    }
  ]);

  const result = stats[0] || {
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: []
  };

  // Calculate rating distribution (1-5 stars)
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  result.ratingDistribution.forEach(rating => {
    distribution[rating]++;
  });

  return {
    ...result,
    ratingDistribution: distribution
  };
};

// Static method to get vendor rating
reviewSchema.statics.calculateVendorRating = async function(vendorId) {
  const stats = await this.aggregate([
    {
      $lookup: {
        from: 'products',
        localField: 'product',
        foreignField: '_id',
        as: 'productInfo'
      }
    },
    {
      $unwind: '$productInfo'
    },
    {
      $match: {
        'productInfo.vendor': new mongoose.Types.ObjectId(vendorId),
        status: 'approved'
      }
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  return stats[0] || {
    averageRating: 0,
    totalReviews: 0
  };
};

// Method to update product and vendor ratings
reviewSchema.methods.updateRatings = async function() {
  const Product = mongoose.model('Product');
  const Vendor = mongoose.model('Vendor');
  
  // Update product rating
  const productRating = await this.constructor.calculateProductRating(this.product);
  await Product.findByIdAndUpdate(this.product, {
    averageRating: productRating.averageRating,
    reviewCount: productRating.totalReviews
  });
  
  // Update vendor rating
  const product = await Product.findById(this.product);
  if (product && product.vendor) {
    const vendorRating = await this.constructor.calculateVendorRating(product.vendor);
    await Vendor.findOneAndUpdate(
      { user: product.vendor },
      {
        averageRating: vendorRating.averageRating,
        reviewCount: vendorRating.totalReviews
      }
    );
  }
};

const Review = mongoose.model("Review", reviewSchema);

export default Review;
