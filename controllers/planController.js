const Plan = require("../models/Plan.js");

// Add Plan
// exports.addPlan = async (req, res) => {
//   try {

//     const { name, duration, price } = req.body;

//     const plan = new Plan({
//       name,
//       duration,
//       price
//     });

//     await plan.save();

//     res.status(201).json({
//       success: true,
//       message: "Plan created successfully",
//       plan
//     });

//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };
exports.addPlan = async (req, res) => {
  try {

    const plans = await Plan.insertMany(req.body);

    res.status(201).json({
      success: true,
      message: "Plans added successfully",
      plans
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

// Delete Plan
exports.deletePlan = async (req, res) => {

  try {

    const plan = await Plan.findByIdAndDelete(req.params.id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found"
      });
    }

    res.json({
      success: true,
      message: "Plan deleted"
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

// Get All Plans
exports.getPlans = async (req, res) => {

  try {

    const plans = await Plan.find();

    res.json({
      success: true,
      plans
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};