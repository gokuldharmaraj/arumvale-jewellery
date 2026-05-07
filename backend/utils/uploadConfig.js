import multer from "multer";
import path from "path";
import fs from "fs";
import express from "express";

// Ensure upload directories exist
const ensureDirectoryExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Create upload directories
ensureDirectoryExists("uploads");
ensureDirectoryExists("uploads/products");
ensureDirectoryExists("uploads/custom-requests");

// Multer configuration for product images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const vendorId = req.user ? req.user._id : "temp";
    const uploadPath = path.join("uploads", "products", vendorId.toString());

    ensureDirectoryExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename =
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname);
    cb(null, filename);
  },
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  const allowedMimes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];

  const fileExtension = path.extname(file.originalname).toLowerCase();
  const fileMime = file.mimetype;

  if (
    allowedMimes.includes(fileMime) &&
    allowedExtensions.includes(fileExtension)
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (JPG, PNG, WebP) are allowed"), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
    files: 10, // Maximum 10 files per request
  },
  fileFilter: fileFilter,
});

// Middleware for handling multiple image uploads
export const uploadProductImages = upload.array("images", 10);

// Middleware for single image upload
export const uploadSingleImage = upload.single("image");

// Multer configuration for custom request design images
const designStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const customerId = req.user ? req.user._id : "temp";
    const uploadPath = path.join(
      "uploads",
      "custom-requests",
      customerId.toString(),
    );

    ensureDirectoryExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename = `design-${uniqueSuffix}${path.extname(file.originalname)}`;
    cb(null, filename);
  },
});

const designUpload = multer({
  storage: designStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
    files: 1, // Single design image per request
  },
  fileFilter: fileFilter, // Reuse existing image filter
});

// Middleware for handling design image upload
export const uploadDesignImage = designUpload.single("designImage");

// Static file serving configuration
export const serveStaticFiles = (app) => {
  app.use("/uploads", express.static("uploads"));
};
