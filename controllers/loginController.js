const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

exports.loginUser = async (req, res) => {

  try {

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    const user = await User.findOne({ email });

    // Same message whether the email or password is wrong,
    // so attackers can't probe which emails have accounts
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Only reveal verification state AFTER the password matched
    if (!user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Please verify OTP first"
      });
    }

    // Bootstrap admin: the ADMIN_EMAIL account is always promoted
    if (
      process.env.ADMIN_EMAIL &&
      user.email === process.env.ADMIN_EMAIL &&
      user.role !== "admin"
    ) {
      user.role = "admin";
      await user.save();
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    res.status(200).json({
      success: true,
      message: "Login successful",
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