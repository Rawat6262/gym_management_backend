const User = require("../models/user");
const Plan = require("../models/Plan");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

// Members ARE users with role "user".
// Admin-created members get a random placeholder password and isVerified:false;
// the member can later sign up with the same email to set their own password.

const SAFE_FIELDS = "-password -otp -otpExpire";

exports.addMember = async (req, res) => {
  try {

    const {
      name,
      phone,
      email,
      age,
      gender,
      address,
      plan
    } = req.body;

    // Validate required fields
    if (!name || !phone || !email || !age || !gender) {
      return res.status(400).json({
        success: false,
        message: "Name, phone, email, age and gender are required"
      });
    }

    const existing = await User.findOne({ email });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "A user with this email already exists"
      });
    }

    let membershipEndDate = null;

    // If plan is provided calculate membership end date
    if (plan) {

      const planData = await Plan.findById(plan);

      if (!planData) {
        return res.status(404).json({
          success: false,
          message: "Plan not found"
        });
      }

      membershipEndDate = new Date();
      membershipEndDate.setDate(
        membershipEndDate.getDate() + planData.duration
      );
    }

    // Placeholder password — replaced when the member signs up with this email
    const randomPassword = crypto.randomBytes(16).toString("hex");
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    const member = await User.create({
      name,
      phone,
      email,
      age,
      gender,
      address,
      plan: plan || null,
      membershipEndDate,
      role: "user",
      password: hashedPassword,
      isVerified: false
    });

    const data = member.toObject();
    delete data.password;
    delete data.otp;
    delete data.otpExpire;

    res.status(201).json({
      success: true,
      message: "Member added successfully",
      data
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

// Update Member (whitelisted fields only — never role/password from here)
exports.updateMember = async (req, res) => {
  try {

    const allowed = [
      "name", "phone", "email", "age", "gender",
      "address", "plan", "membershipEndDate", "photo", "pending_amount"
    ];

    const updates = {};
    for (const field of allowed) {
      if (req.body[field] !== undefined && req.body[field] !== "") {
        updates[field] = req.body[field];
      }
    }

    // Allow clearing the plan
    if (req.body.plan === "") updates.plan = null;

    const member = await User.findOneAndUpdate(
      { _id: req.params.id, role: "user" },
      updates,
      { new: true }
    ).select(SAFE_FIELDS);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Member updated",
      member
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete Member (cannot delete admins from here)
exports.deleteMember = async (req, res) => {
  try {

    const member = await User.findOneAndDelete({
      _id: req.params.id,
      role: "user"
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Member deleted"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getExpiredMembers = async (req, res) => {

  try {

    const today = new Date();

    const members = await User.find({
      role: "user",
      membershipEndDate: { $lt: today }
    }).select(SAFE_FIELDS);

    res.json({
      success: true,
      members
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};

exports.expiringSoon = async (req, res) => {

  try {

    const today = new Date();
    const next7Days = new Date();

    next7Days.setDate(today.getDate() + 7);

    const members = await User.find({
      role: "user",
      membershipEndDate: {
        $gte: today,
        $lte: next7Days
      }
    }).select(SAFE_FIELDS);

    res.json({
      success: true,
      members
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};

exports.getMembers = async (req, res) => {
  try {

    let data = await User.find({ role: "user" })
      .select(SAFE_FIELDS)
      .populate("plan", "planname price duration");

    res.status(200).json({
      success: true,
      message: "all members",
      data: data
    });
  }
  catch (error) {

    res.status(500).json({
      message: error.message
    });
  }
};
