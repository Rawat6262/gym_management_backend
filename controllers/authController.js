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

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = generateOtp();
    const otpExpire = new Date(Date.now() + 5 * 60 * 1000);

    let user;

    if (existingUser) {

      // update existing unverified user
      existingUser.name = name;
      existingUser.password = hashedPassword; // ✅ FIX
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

    await user.save();

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
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