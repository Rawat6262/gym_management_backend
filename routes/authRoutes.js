const express = require("express");
const router = express.Router();

const { requestOtp, verifyOtp, createUser } = require("../controllers/authController");
const { loginUser } = require("../controllers/loginController");

router.post("/signup",createUser);
router.post("/login",loginUser);
// router.post("/request-otp", requestOtp);
router.post("/verify-otp", verifyOtp);


module.exports = router;