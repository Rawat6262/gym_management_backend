const express = require("express");
const router = express.Router();

const {
  getDashboardStats,
  monthlyRevenue
} = require("../controllers/dashboardController");

// routes
router.get("/stats", getDashboardStats);
router.get("/revenue", monthlyRevenue); // ✅ FIXED spelling

module.exports = router;