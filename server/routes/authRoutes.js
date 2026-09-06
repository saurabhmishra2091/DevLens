const express = require("express");
const {
  registerUser,
  loginUser,
  getUserProfile,
  logoutUser,
  changePassword,
  deleteAccount,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getUserProfile);
router.post("/logout", logoutUser);
// Change password
router.put(
  "/change-password",
  protect,
  changePassword
);

// Delete account
router.delete(
  "/delete-account",
  protect,
  deleteAccount
);
module.exports = router;
