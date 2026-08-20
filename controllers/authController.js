const User = require("../models/user");
const generateOtp = require("../utils/genrateOtp");
const sendEmail = require("../utils/sendMail");

const bcrypt = require("bcryptjs");

exports.createUser = async (req, res) => {
  try {

    const { name, email, password } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required"
      });
    }

    const existingUser = await User.findOne({ email });

    // A verified account can never be overwritten by a new signup
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists. Please login."
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = generateOtp();
    const otpExpire = new Date(Date.now() + 5 * 60 * 1000);

    let user;

    if (existingUser) {

      // Unverified user — either a repeat signup or a member the admin
      // pre-created: they claim the account by setting their own password.
      // Membership fields (plan, end date, pending amount) are kept.
      existingUser.name = name;
      existingUser.password = hashedPassword;
      existingUser.otp = otp;
      existingUser.otpExpire = otpExpire;

      user = await existingUser.save();

    } else {

      // create new user
      user = await User.create({
        name,
        email,
        password: hashedPassword, // ✅ FIX
        otp,
        otpExpire
      });

    }

    await sendEmail(email, otp);

    res.status(200).json({
      success: true,
      message: "OTP sent successfully"
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};
// Resend OTP to an unverified account
exports.resendOtp = async (req, res) => {
  try {

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No signup found for this email. Please sign up first."
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Account already verified. Please login."
      });
    }

    user.otp = generateOtp();
    user.otpExpire = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    await sendEmail(email, user.otp);

    res.json({
      success: true,
      message: "A new OTP has been sent to your email"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Forgot password — send an OTP to the account's email.
// Response is the same whether or not the account exists (anti-enumeration).
exports.forgotPassword = async (req, res) => {
  try {

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    const user = await User.findOne({ email });

    if (user) {
      user.otp = generateOtp();
      user.otpExpire = new Date(Date.now() + 5 * 60 * 1000);
      await user.save();

      await sendEmail(email, user.otp);
    }

    res.json({
      success: true,
      message: "If an account with this email exists, an OTP has been sent to it."
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Reset password using the OTP from forgotPassword
exports.resetPassword = async (req, res) => {
  try {

    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP and new password are required"
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters"
      });
    }

    const user = await User.findOne({ email });

    if (!user || !user.otp || user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP"
      });
    }

    if (user.otpExpire < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired. Please request a new one."
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = null;
    user.otpExpire = null;
    // Entering the emailed OTP proves ownership of the email
    user.isVerified = true;

    await user.save();

    res.json({
      success: true,
      message: "Password reset successfully. Please login with your new password."
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const jwt = require("jsonwebtoken");

exports.verifyOtp = async (req, res) => {
  try {

    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "User already verified"
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP"
      });
    }

    if (user.otpExpire < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired"
      });
    }

    // verify user
    user.isVerified = true;
    user.otp = null;
    user.otpExpire = null;

    // Bootstrap admin: the ADMIN_EMAIL account is always promoted
    if (
      process.env.ADMIN_EMAIL &&
      user.email === process.env.ADMIN_EMAIL
    ) {
      user.role = "admin";
    }

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified
    };

    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      token,
      user: userData
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};