const express = require("express");
const router = express.Router();

const { protect, adminOnly } = require("../middleware/authMiddleware");

const { checkInMember } = require("../controllers/attendanceController");

router.post("/check-in", protect, adminOnly, checkInMember);

module.exports = router;
