const RenewalRequest = require("../models/RenewalRequest");

// Admin: list all renewal requests
exports.getAllRenewals = async (req, res) => {

  try {

    const requests = await RenewalRequest.find()
      .populate("member", "name phone email membershipEndDate")
      .populate("plan", "planname price duration")
      .populate("user", "name email")
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

// Admin: approve or reject a renewal request
exports.updateRenewalStatus = async (req, res) => {

  try {

    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be 'approved' or 'rejected'"
      });
    }

    const request = await RenewalRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .populate("member", "name phone email")
      .populate("plan", "planname price duration");

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Renewal request not found"
      });
    }

    res.json({
      success: true,
      message: `Renewal request ${status}`,
      request
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};
