const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  getProfile,
  updateProfile,
  changePassword,
  getMyMembership,
  getMyPayments,
  createRenewalRequest,
  getMyRenewals
} = require("../controllers/userController");

const { getMyAttendance } = require("../controllers/attendanceController");

// All routes here need a logged-in user (any role)
router.use(protect);

router.get("/me", getProfile);
router.put("/me", updateProfile);
router.put("/change-password", changePassword);
router.get("/my-membership", getMyMembership);
router.get("/my-payments", getMyPayments);
router.get("/my-attendance", getMyAttendance);
router.post("/renew-request", createRenewalRequest);
router.get("/my-renewals", getMyRenewals);

module.exports = router;
