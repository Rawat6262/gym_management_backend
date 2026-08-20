const express = require("express");
const router = express.Router();

const { protect, adminOnly } = require("../middleware/authMiddleware");

const {
  getTrainers,
  addTrainer,
  updateTrainer,
  deleteTrainer
} = require("../controllers/trainerController");

// Trainer management is admin only (public view is /api/public/trainers)
router.use(protect, adminOnly);

router.get("/", getTrainers);
router.post("/", addTrainer);
router.put("/:id", updateTrainer);
router.delete("/:id", deleteTrainer);

module.exports = router;
