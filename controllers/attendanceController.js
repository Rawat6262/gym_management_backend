const Attendance = require("../models/Attendance");

exports.checkInMember = async (req, res) => {

  try {

    const { memberId } = req.body;

    const attendance = new Attendance({
      member: memberId
    });

    await attendance.save();

    res.json({
      success: true,
      message: "Member checked in"
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};