const express = require("express");
const router = express.Router();

const { protect, adminOnly } = require("../middleware/authMiddleware");

const { addPlan, getPlans, deletePlan } = require("../controllers/planController");

// Any logged-in user can browse plans (needed for renewal)
router.get("/", protect, getPlans);

// Only admin can create or delete plans
router.post("/add-plan", protect, adminOnly, addPlan);
router.delete("/:id", protect, adminOnly, deletePlan);

module.exports = router;
