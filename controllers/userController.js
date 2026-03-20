const User = require("../models/user");

// Get logged in user profile
exports.getProfile = async (req, res) => {

  try {

    const user = await User.findById(req.user.id).select("-otp");

    res.json({
      success: true,
      user
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};


// Update user profile
exports.updateProfile = async (req, res) => {

  try {

    const user = await User.findByIdAndUpdate(
      req.user.id,
      req.body,
      { new: true }
    );

    res.json({
      success: true,
      user
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};