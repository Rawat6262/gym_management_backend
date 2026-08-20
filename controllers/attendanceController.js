const Attendance = require("../models/Attendance");
const User = require("../models/user");

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

exports.checkInMember = async (req, res) => {

  try {

    const { memberId } = req.body;

    if (!memberId) {
      return res.status(400).json({
        success: false,
        message: "memberId is required"
      });
    }

    const member = await User.findOne({ _id: memberId, role: "user" });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found"
      });
    }

    // Only one check-in per member per day
    const alreadyToday = await Attendance.findOne({
      member: memberId,
      checkInTime: { $gte: startOfToday() }
    });

    if (alreadyToday) {
      return res.status(400).json({
        success: false,
        message: `${member.name} has already checked in today`
      });
    }

    const expired =
      member.membershipEndDate &&
      new Date(member.membershipEndDate) < new Date();

    await Attendance.create({ member: memberId });

    res.json({
      success: true,
      message: expired
        ? `${member.name} checked in — ⚠️ membership expired, ask them to renew`
        : `${member.name} checked in`,
      membershipExpired: !!expired
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};

// Logged-in user's own attendance history + summary
exports.getMyAttendance = async (req, res) => {

  try {

    const records = await Attendance.find({ member: req.user.id })
      .select("checkInTime")
      .sort({ checkInTime: -1 })
      .limit(100)
      .lean();

    const total = await Attendance.countDocuments({ member: req.user.id });

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const thisMonth = await Attendance.countDocuments({
      member: req.user.id,
      checkInTime: { $gte: monthStart }
    });

    res.json({
      success: true,
      total,
      thisMonth,
      lastCheckIn: records[0]?.checkInTime || null,
      records
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};

// Admin: attendance for a specific date (defaults to today)
exports.getAttendanceByDate = async (req, res) => {

  try {

    const day = req.query.date ? new Date(req.query.date) : new Date();

    if (isNaN(day.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date"
      });
    }

    const from = new Date(day);
    from.setHours(0, 0, 0, 0);

    const to = new Date(day);
    to.setHours(23, 59, 59, 999);

    const records = await Attendance.find({
      checkInTime: { $gte: from, $lte: to }
    })
      .populate("member", "name phone email membershipEndDate")
      .sort({ checkInTime: -1 });

    res.json({
      success: true,
      count: records.length,
      records
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};

// Today's check-ins (admin)
exports.getTodayAttendance = async (req, res) => {

  try {

    const records = await Attendance.find({
      checkInTime: { $gte: startOfToday() }
    })
      .populate("member", "name phone email membershipEndDate")
      .sort({ checkInTime: -1 });

    res.json({
      success: true,
      count: records.length,
      records
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};
