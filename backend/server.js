import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import cookieParser from "cookie-parser";
import metalRoutes from "./routes/metalRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import vendorRoutes from "./routes/vendorRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import customRequestRoutes from "./routes/customRequestRoutes.js";
import emailRoutes from "./routes/emailRoutes.js";
import { serveStaticFiles } from "./utils/uploadConfig.js";
import "./models/User.js";
import "./models/Vendor.js";
import "./models/Product.js";
import "./models/Order.js";
import "./models/Review.js";
import "./models/CustomRequest.js";
dotenv.config();
connectDB();
const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:8080", "http://localhost:5173"],
    credentials: true,
  }),
);

app.use("/api/auth", authRoutes);

app.use("/api/metals", metalRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api/products", productRoutes);

app.use("/api/vendors", vendorRoutes);

app.use("/api/orders", orderRoutes);

app.use("/api/cart", cartRoutes);

app.use("/api/reviews", reviewRoutes);

app.use("/api/analytics", analyticsRoutes);

app.use("/api/custom-requests", customRequestRoutes);

app.use("/api/email", emailRoutes);

// Serve static files for uploaded images
serveStaticFiles(app);

app.get("/", (req, res) => {
  res.send("API running...");
});
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.get("/test", (req, res) => {
  res.send("Server working");
});
