import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    let token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        message: "Not authorized, no token",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // fetch full user (without password)
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    // attach full user to request
    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Not authorized, token failed",
    });
  }
};

// Middleware to check if user is admin
export const adminOnly = async (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({
      message: "Access denied. Admin only.",
    });
  }
};

// Middleware to check if user is approved vendor
export const approvedVendorOnly = async (req, res, next) => {
  if (req.user && req.user.role === "vendor" && req.user.isApproved) {
    next();
  } else if (req.user && req.user.role === "vendor" && !req.user.isApproved) {
    return res.status(403).json({
      message: "Access denied. Vendor account is pending approval.",
    });
  } else {
    return res.status(403).json({
      message: "Access denied. Approved vendors only.",
    });
  }
};

// Middleware to check if user can access vendor routes (admin or approved vendor)
export const vendorAccess = async (req, res, next) => {
  if (
    req.user &&
    (req.user.role === "admin" ||
      (req.user.role === "vendor" && req.user.isApproved))
  ) {
    next();
  } else {
    return res.status(403).json({
      message: "Access denied. Invalid permissions.",
    });
  }
};

// Generic authorization middleware for specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Not authorized, user not found",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Required roles: ${roles.join(", ")}`,
      });
    }

    next();
  };
};
