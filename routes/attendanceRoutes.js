const express = require("express");
const router = express.Router();

const { checkInMember } = require("../controllers/attendanceController");

router.post("/check-in", checkInMember);

module.exports = router;