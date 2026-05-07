import Vendor from "../models/Vendor.js";
import User from "../models/User.js";

// Get vendor profile by user ID
export const getVendorProfile = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id }).populate(
      "user",
      "-password",
    );

    if (!vendor) {
      return res.status(404).json({ message: "Vendor profile not found" });
    }

    res.json(vendor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all vendors (for admin)
export const getAllVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find({})
      .populate("user", "-password")
      .sort({ createdAt: -1 });

    res.json(vendors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get approved vendors for customers
export const getApprovedVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find({
      isVerified: true,
      isActive: true,
    })
      .populate("user", "-password")
      .select("_id shopName shopType yearsInBusiness user")
      .sort({ shopName: 1 });

    res.json(vendors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update vendor profile
export const updateVendorProfile = async (req, res) => {
  try {
    const {
      shopName,
      shopType,
      yearsInBusiness,
      website,
      description,
      gstNumber,
      panNumber,
      bisHallmark,
      bankName,
      accountNumber,
      ifscCode,
    } = req.body;

    const vendor = await Vendor.findOne({ user: req.user._id });

    if (!vendor) {
      return res.status(404).json({ message: "Vendor profile not found" });
    }

    // Update vendor record
    const updatedVendor = await Vendor.findByIdAndUpdate(
      vendor._id,
      {
        shopName,
        shopType,
        yearsInBusiness,
        website,
        description,
        gstNumber,
        panNumber,
        bisHallmark,
        bankName,
        accountNumber,
        ifscCode,
      },
      { new: true, runValidators: true },
    ).populate("user", "-password");

    // Also update user record with vendor fields
    await User.findByIdAndUpdate(req.user._id, {
      shopName,
      shopType,
      yearsInBusiness,
      website,
      description,
      gstNumber,
      panNumber,
      bisHallmark,
      bankName,
      accountNumber,
      ifscCode,
    });

    res.json(updatedVendor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Approve vendor (for admin)
export const approveVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { approved, rejectionReason } = req.body;

    const vendor = await Vendor.findById(vendorId).populate("user");

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    // Update user approval status
    await User.findByIdAndUpdate(vendor.user._id, {
      isApproved: approved,
      approvalDate: approved ? new Date() : null,
      rejectedReason: approved ? null : rejectionReason,
    });

    // Update vendor verification status
    await Vendor.findByIdAndUpdate(vendorId, {
      isVerified: approved,
      verificationDate: approved ? new Date() : null,
    });

    res.json({
      message: approved ? "Vendor approved successfully" : "Vendor rejected",
      vendor,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Suspend/unsuspend vendor (for admin)
export const toggleVendorStatus = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { isActive, suspensionReason } = req.body;

    const vendor = await Vendor.findByIdAndUpdate(
      vendorId,
      {
        isActive,
        suspensionReason: isActive ? null : suspensionReason,
        suspensionDate: isActive ? null : new Date(),
      },
      { new: true },
    ).populate("user", "-password");

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    res.json({
      message: isActive ? "Vendor activated successfully" : "Vendor suspended",
      vendor,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get vendor statistics
export const getVendorStats = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id });

    if (!vendor) {
      return res.status(404).json({ message: "Vendor profile not found" });
    }

    // TODO: Calculate actual stats from orders and products
    const stats = {
      totalProducts: vendor.totalProducts,
      totalSales: vendor.totalSales,
      averageRating: vendor.averageRating,
      reviewCount: vendor.reviewCount,
      isActive: vendor.isActive,
      isVerified: vendor.isVerified,
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete vendor (for admin)
export const deleteVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const vendor = await Vendor.findById(vendorId);

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    // Delete the vendor record
    await Vendor.findByIdAndDelete(vendorId);

    // Delete the associated user record
    await User.findByIdAndDelete(vendor.user);

    res.json({ message: "Vendor deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
