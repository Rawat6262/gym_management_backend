const jwt = require("jsonwebtoken");
const User = require("../models/user");

// Verify JWT and attach the logged-in user to req.user
exports.protect = async (req, res, next) => {
  try {

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token"
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Load fresh user so role changes take effect immediately
    const user = await User.findById(decoded.id).select("-password -otp -otpExpire");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists"
      });
    }

    req.user = user;
    next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, token invalid or expired"
    });
  }
};

// Allow only admins past this point
exports.adminOnly = (req, res, next) => {

  if (req.user && req.user.role === "admin") {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: "Access denied: admin only"
  });
};
