const express = require("express");
const {
  registerUser,
  loginUser,
  getUserProfile,
  logoutUser,
  changePassword,
  deleteAccount,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getUserProfile);
router.post("/logout", logoutUser);
router.put("/change-password", protect, changePassword);
router.delete("/delete-account", protect, deleteAccount);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

module.exports = router;
