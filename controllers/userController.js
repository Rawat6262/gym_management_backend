const User = require("../models/user");
const Payment = require("../models/Payment");
const Plan = require("../models/Plan");
const RenewalRequest = require("../models/RenewalRequest");
const bcrypt = require("bcryptjs");

const SAFE_FIELDS = "-password -otp -otpExpire";

// Get logged in user profile
exports.getProfile = async (req, res) => {

  try {

    const user = await User.findById(req.user.id)
      .select(SAFE_FIELDS)
      .populate("plan", "planname price duration");

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


// Update user profile (only safe fields — email, role, password and
// membership/billing fields can never be changed from here)
exports.updateProfile = async (req, res) => {

  try {

    const allowed = ["name", "phone", "age", "gender", "address"];

    const updates = {};
    for (const field of allowed) {
      if (req.body[field] !== undefined && req.body[field] !== "") {
        updates[field] = req.body[field];
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true }
    ).select(SAFE_FIELDS);

    res.json({
      success: true,
      message: "Profile updated",
      user
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};

// Change password (requires the current password)
exports.changePassword = async (req, res) => {

  try {

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current and new password are required"
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters"
      });
    }

    const user = await User.findById(req.user.id);

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect"
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({
      success: true,
      message: "Password changed successfully"
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};

// Get my membership details — the logged-in user IS the member
exports.getMyMembership = async (req, res) => {

  try {

    const member = await User.findById(req.user.id)
      .select(SAFE_FIELDS)
      .populate("plan");

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

    const payments = await Payment.find({ member: req.user.id })
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

    const plan = await Plan.findById(planId);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found"
      });
    }

    const existing = await RenewalRequest.findOne({
      member: req.user.id,
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
      member: req.user.id,
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
