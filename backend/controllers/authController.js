import User from "../models/User.js";
import Vendor from "../models/Vendor.js";
import generateToken from "../utils/generateToken.js";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";

export const registerUser = async (req, res) => {
  try {
    const {
      username,
      firstName,
      lastName,
      email,
      password,
      role,
      phone,
      dob,
      gender,
      address,
      city,
      state,
      pincode,
      // Vendor-specific fields
      ownerName,
      shopName,
      gstNumber,
      panNumber,
      bisHallmark,
      shopType,
      yearsInBusiness,
      website,
      description,
      bankName,
      accountNumber,
      ifscCode,
    } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // For vendor registration, check if GST or PAN already exists
    if (role === "vendor") {
      const existingGST = await Vendor.findOne({ gstNumber });
      const existingPAN = await Vendor.findOne({ panNumber });

      if (existingGST) {
        return res
          .status(400)
          .json({ message: "GST number already registered" });
      }

      if (existingPAN) {
        return res
          .status(400)
          .json({ message: "PAN number already registered" });
      }
    }

    // Create user with all fields
    const userData = {
      firstName,
      lastName,
      email,
      password,
      role: role || "user",
      phone,
      dob: dob ? new Date(dob) : undefined,
      gender,
      address: {
        fullAddress: address || "",
        city: city || "",
        state: state || "",
        pincode: pincode || "",
        country: "India",
      },
    };

    // Add vendor-specific fields if registering as vendor
    if (role === "vendor") {
      // Generate username if not provided
      if (!username && shopName) {
        userData.username =
          shopName.toLowerCase().replace(/\s+/g, "_") + "_" + Date.now();
      } else if (username) {
        userData.username = username;
      }
    } else {
      // For non-vendor users, username is required
      if (!username) {
        return res.status(400).json({ message: "Username is required" });
      }
      userData.username = username;
    }

    const user = await User.create(userData);

    // Create vendor record if role is vendor
    if (role === "vendor") {
      await Vendor.create({
        user: user._id,
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
    }

    const token = generateToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, //30 days
    });

    const response = {
      _id: user._id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      dob: user.dob,
      gender: user.gender,
      address: user.address,
      role: user.role,
      isApproved: user.isApproved,
      approvalDate: user.approvalDate,
      message:
        role === "vendor"
          ? "Vendor registration submitted! Your application will be reviewed within 24-48 hours."
          : "User Registration successful",
    };

    // Add vendor-specific response data
    if (role === "vendor") {
      const vendor = await Vendor.findOne({ user: user._id });
      if (vendor) {
        Object.assign(response, {
          ownerName: firstName, // Use firstName as ownerName for vendors
          shopName: vendor.shopName,
          shopType: vendor.shopType,
          yearsInBusiness: vendor.yearsInBusiness,
          website: vendor.website,
          description: vendor.description,
        });
      }
    }

    // Send welcome email
    try {
      await sendEmail({
        to: user.email,
        subject: "Welcome to Arumvale Jewellery!",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #d4af37;">Welcome to Arumvale Jewellery!</h2>
            <p>Dear ${firstName},</p>
            <p>Thank you for registering with us. Your account has been created successfully.</p>
            <p>You can now log in and start exploring our beautiful jewellery collection.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="http://localhost:5173/login" style="background: #d4af37; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Login to Your Account
              </a>
            </div>
            <p style="color: #666; font-size: 12px; margin-top: 20px;">
              If you have any questions, feel free to contact our support team.
            </p>
            <hr style="border: 1px solid #eee; margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">
              Best regards,<br>
              The Arumvale Jewellery Team
            </p>
          </div>
        `,
        text: `Welcome to Arumvale Jewellery!\n\nDear ${firstName},\n\nThank you for registering with us. Your account has been created successfully.\n\nYou can now log in and start exploring our beautiful jewellery collection.\n\nLogin here: http://localhost:5173/login\n\nBest regards,\nThe Arumvale Jewellery Team`,
      });
    } catch (emailError) {
      console.error("Welcome email error:", emailError);
      // Don't fail registration if email fails
    }

    res.status(201).json(response);
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (user && (await user.matchPassword(password))) {
      //Role validation

      if (req.body.role && req.body.role !== user.role) {
        return res.status(403).json({
          message: "Unauthorized role access",
        });
      }

      const token = generateToken(user._id);

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000, //30 days
      });
      res.json({
        _id: user._id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        dob: user.dob,
        gender: user.gender,
        address: user.address,
        role: user.role,
        isApproved: user.isApproved,
        approvalDate: user.approvalDate,
        message: "User Login successful",
      });
    } else {
      res.status(401).json({ message: "Invalidd email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const logoutUser = (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: "Logged out sucessfully" });
};

export const getMe = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      _id: user._id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      dob: user.dob,
      gender: user.gender,
      address: user.address,
      role: user.role,
      isApproved: user.isApproved,
      approvalDate: user.approvalDate,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    // Always return generic message for security
    if (!user) {
      return res.json({
        message: "If an account exists with this email, an OTP has been sent.",
      });
    }

    // Generate 6-digit OTP
    const resetOTP = Math.floor(100000 + Math.random() * 900000).toString();

    // Set OTP and expiry (10 minutes)
    user.passwordResetOTP = resetOTP;
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    user.passwordResetVerified = false;
    await user.save();

    // Send OTP email
    await sendEmail({
      to: user.email,
      subject: "Password Reset OTP - Arumvale Jewellery",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #d4af37;">Arumvale Jewellery</h2>
          <p>You requested to reset your password. Use the OTP below to verify your identity:</p>
          <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
            <h3 style="color: #d4af37; font-size: 32px; letter-spacing: 8px; margin: 0;">${resetOTP}</h3>
          </div>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">
            This OTP expires in 10 minutes. If you didn't request this, please ignore this email.
          </p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            Arumvale Jewellery Team
          </p>
        </div>
      `,
      text: `Your password reset OTP is: ${resetOTP}\n\nThis OTP expires in 10 minutes.`,
    });

    res.json({
      message: "If an account exists with this email, an OTP has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Error processing request" });
  }
};

export const verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Find user with valid OTP
    const user = await User.findOne({
      email,
      passwordResetOTP: otp,
      passwordResetExpires: { $gt: Date.now() },
    }).select("+passwordResetOTP +passwordResetExpires +passwordResetVerified");

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Mark as verified
    user.passwordResetVerified = true;
    await user.save();

    res.json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ message: "Error verifying OTP" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user with verified OTP
    const user = await User.findOne({
      email,
      passwordResetVerified: true,
      passwordResetExpires: { $gt: Date.now() },
    }).select("+passwordResetVerified +passwordResetExpires");

    if (!user) {
      return res
        .status(400)
        .json({ message: "OTP verification required or expired" });
    }

    // Update password
    user.password = password;

    // Clear OTP fields
    user.passwordResetOTP = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = false;

    await user.save();

    res.json({
      message:
        "Password reset successful. Please log in with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Error resetting password" });
  }
};
