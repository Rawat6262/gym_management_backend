// const Member = require("../models/Member");

const Member = require("../models/Member");
const Plan = require("../models/Plan");

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

      // const joinDate = new Date();

      membershipEndDate = new Date();
      membershipEndDate.setDate(
        membershipEndDate.getDate() + planData.duration
      );
    }

    const member = await Member.create({
      name,
      phone,
      email,
      age,
      gender,
      address,
      plan,
      membershipEndDate
    });

    res.status(201).json({
      success: true,
      message: "Member added successfully",
      data: member
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};
// Update Member
exports.updateMember = async (req, res) => {
  try {

    const member = await Member.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

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

// Delete Member
exports.deleteMember = async (req, res) => {
  try {

    await Member.findByIdAndDelete(req.params.id);

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

    const members = await Member.find({
      membershipEndDate: { $lt: today }
    });

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

    const members = await Member.find({
      membershipEndDate: {
        $gte: today,
        $lte: next7Days
      }
    });

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
exports.getMembers =async(req,res)=>{
  try{

    let data = await Member.find({}).populate('plan','planname')
    res.status(200).json({
      success: true,
      message: "all members",
      data:data
    });
  }
catch (error) {

    res.status(500).json({
      message: error.message
    });
  }
}