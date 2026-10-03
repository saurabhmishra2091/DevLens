const crypto = require("crypto");
const User = require("../models/User");
const ScanReport = require("../models/ScanReport");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Helper function to generate JWT Token
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is not set");
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// Register a new user
exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ // 409 instead of 400
        success: false,
        message: "User with this email already exists",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email },
      token,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Login user
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter email and password",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email },
      token,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get current user profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.logoutUser = async (req, res) => {
  try {
    res.clearCookie("token");

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// ==========================================
// CHANGE PASSWORD
// ==========================================

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Check fields
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    // Find logged-in user
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check current password
    const isMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Validate new password
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);

    user.password = await bcrypt.hash(
      newPassword,
      salt
    );

    await user.save();

    res.json({
      success: true,
      message: "Password changed successfully",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ==========================================
// DELETE ACCOUNT
// ==========================================

exports.deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    // Find logged-in user
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect password",
      });
    }

    // Delete user's scan reports
    const ScanReport = require("../models/ScanReport");

    await ScanReport.deleteMany({
      user: user._id,
    });

    // Delete user account
    await User.findByIdAndDelete(
      user._id
    );

    res.json({
      success: true,
      message: "Account deleted successfully",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// ==========================================
// FORGOT PASSWORD
// ==========================================

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please provide your email address",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({
        success: true,
        message: "If that email exists, a reset token has been generated.",
      });
    }

    // Generate a secure random token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash the token before storing (store hash, send plain)
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    // Store the plain token temporarily so the user can retrieve it once
    // via GET /api/auth/reset-token (protected by the same token lookup).
    // We keep the plain token in memory only for this response.
    res.json({
      success: true,
      message: "Password reset token generated. Copy it — it is only shown once.",
      resetToken,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// RESET PASSWORD
// ==========================================

exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password is required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // Hash the incoming token to compare with stored hash
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Reset token is invalid or has expired",
      });
    }

    // Set new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save();

    res.json({
      success: true,
      message: "Password reset successfully. You can now log in.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};