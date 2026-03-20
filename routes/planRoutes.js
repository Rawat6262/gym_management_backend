const express = require("express");
const router = express.Router();

const { addPlan, getPlans } = require("../controllers/planController");

router.post("/add-plan", addPlan);
router.get("/", getPlans);
router.delete("/:id", async (req, res) => {
  await Plan.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Plan deleted" });
});
module.exports = router;