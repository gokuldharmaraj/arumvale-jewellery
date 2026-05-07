import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyResetOtp);
router.post("/reset-password", resetPassword);

router.get("/me", protect, getMe);

export default router;
