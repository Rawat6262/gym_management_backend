const express = require("express");
const router = express.Router();

const {
  recordPayment,
  paymentHistory,
  getAllPayments
} = require("../controllers/paymentController");

router.post("/pay", recordPayment);
router.get("/member/:id", paymentHistory);
router.get("/getpayment", getAllPayments);

module.exports = router;