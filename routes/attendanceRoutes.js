const express = require("express");
const router = express.Router();

const { protect, adminOnly } = require("../middleware/authMiddleware");

const { checkInMember, getTodayAttendance, getAttendanceByDate } = require("../controllers/attendanceController");

router.use(protect, adminOnly);

router.post("/check-in", checkInMember);
router.get("/today", getTodayAttendance);
router.get("/by-date", getAttendanceByDate);

module.exports = router;
