const User = require("../models/user");
const Member = require("../models/Member");
const Payment = require("../models/Payment");
const Plan = require("../models/Plan");
const RenewalRequest = require("../models/RenewalRequest");

// Get logged in user profile
exports.getProfile = async (req, res) => {

  try {

    const user = await User.findById(req.user.id).select("-password -otp -otpExpire");

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


// Update user profile (only safe fields — never role/password/email from here)
exports.updateProfile = async (req, res) => {

  try {

    const { name, phone } = req.body;

    const updates = {};
    if (name) updates.name = name;
    if (phone) updates.phone = phone;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true }
    ).select("-password -otp -otpExpire");

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

// Find the gym Member record linked to the logged-in account (matched by email)
const findMyMember = (email) =>
  Member.findOne({ email }).populate("plan");

// Get my membership details (plan, end date, days left, status)
exports.getMyMembership = async (req, res) => {

  try {

    const member = await findMyMember(req.user.email);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "No gym membership is linked to your account yet. Please contact the gym admin."
      });
    }

    const today = new Date();
    let daysLeft = null;
    let status = "no_plan";

    if (member.membershipEndDate) {
      const end = new Date(member.membershipEndDate);
      daysLeft = Math.ceil((end - today) / (1000 * 60 * 60 * 24));

      if (daysLeft < 0) status = "expired";
      else if (daysLeft <= 7) status = "expiring_soon";
      else status = "active";
    }

    res.json({
      success: true,
      membership: {
        member,
        daysLeft,
        status
      }
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};

// Get my payment history
exports.getMyPayments = async (req, res) => {

  try {

    const member = await Member.findOne({ email: req.user.email });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "No gym membership is linked to your account yet."
      });
    }

    const payments = await Payment.find({ member: member._id })
      .populate("plan", "planname price duration")
      .sort({ paymentDate: -1 });

    res.json({
      success: true,
      payments
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};

// Request a plan renewal (admin approves and records the payment at the desk)
exports.createRenewalRequest = async (req, res) => {

  try {

    const { planId } = req.body;

    if (!planId) {
      return res.status(400).json({
        success: false,
        message: "planId is required"
      });
    }

    const member = await Member.findOne({ email: req.user.email });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "No gym membership is linked to your account yet. Please contact the gym admin."
      });
    }

    const plan = await Plan.findById(planId);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found"
      });
    }

    const existing = await RenewalRequest.findOne({
      member: member._id,
      status: "pending"
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending renewal request"
      });
    }

    const request = await RenewalRequest.create({
      user: req.user.id,
      member: member._id,
      plan: plan._id
    });

    res.status(201).json({
      success: true,
      message: "Renewal request sent. The gym admin will contact you to complete the payment.",
      request
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};

// Get my renewal requests
exports.getMyRenewals = async (req, res) => {

  try {

    const requests = await RenewalRequest.find({ user: req.user.id })
      .populate("plan", "planname price duration")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      requests
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};
