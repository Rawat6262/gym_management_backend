const express = require("express");
const router = express.Router();

const {
  createUser,
  verifyOtp,
  resendOtp,
  forgotPassword,
  resetPassword
} = require("../controllers/authController");
const { loginUser } = require("../controllers/loginController");

router.post("/signup", createUser);
router.post("/login", loginUser);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
