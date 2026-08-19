const express = require("express");
const router = express.Router();

const { protect, adminOnly } = require("../middleware/authMiddleware");

const {
  recordPayment,
  collectDues,
  paymentHistory,
  getAllPayments
} = require("../controllers/paymentController");

// Payments are recorded and viewed by admin only
// (members see their own history via /api/user/my-payments)
router.use(protect, adminOnly);

router.post("/pay", recordPayment);
router.post("/collect-dues", collectDues);
router.get("/member/:id", paymentHistory);
router.get("/getpayment", getAllPayments);

module.exports = router;
