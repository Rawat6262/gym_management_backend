const Member = require("../models/Member");
const Payment = require("../models/Payment");

exports.getDashboardStats = async (req, res) => {

  try {

    const totalMembers = await Member.countDocuments();

    const activeMembers = await Member.countDocuments({
      membershipEndDate: { $gte: new Date() }
    });

    const expiredMembers = await Member.countDocuments({
      membershipEndDate: { $lt: new Date() }
    });

    const payments = await Payment.find();

    const revenue = payments.reduce(
      (sum, p) => sum + p.amount,
      0
    );

    res.json({
      totalMembers,
      activeMembers,
      expiredMembers,
      totalRevenue: revenue
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};
exports.monthlyRevenue = async (req, res) => {
  try {

    const revenue = await Payment.aggregate([
      {
        $group: {
          _id: { $month: "$paymentDate" },
          total: { $sum: "$amount" }
        }
      },
      {
        $sort: { _id: 1 } // ✅ sort months
      }
    ]);

    res.json({
      success: true,
      revenue
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};