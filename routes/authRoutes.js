const express = require("express");
const router = express.Router();

const { createUser, verifyOtp, resendOtp } = require("../controllers/authController");
const { loginUser } = require("../controllers/loginController");

router.post("/signup", createUser);
router.post("/login", loginUser);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);

module.exports = router;
