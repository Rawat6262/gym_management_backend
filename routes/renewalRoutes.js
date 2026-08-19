const express = require("express");
const router = express.Router();

const { protect, adminOnly } = require("../middleware/authMiddleware");

const {
  getAllRenewals,
  updateRenewalStatus
} = require("../controllers/renewalController");

router.use(protect, adminOnly);

router.get("/", getAllRenewals);
router.put("/:id", updateRenewalStatus);

module.exports = router;
