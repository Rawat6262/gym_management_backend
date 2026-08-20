const Trainer = require("../models/Trainer");

// Admin: list all trainers (including inactive)
exports.getTrainers = async (req, res) => {
  try {

    const trainers = await Trainer.find().sort({ createdAt: 1 });

    res.json({ success: true, trainers });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: create trainer
exports.addTrainer = async (req, res) => {
  try {

    const { name, photo, designation, experience, specialization, bio, phone, isActive } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Trainer name is required"
      });
    }

    const trainer = await Trainer.create({
      name, photo, designation, experience, specialization, bio, phone, isActive
    });

    res.status(201).json({
      success: true,
      message: "Trainer added",
      trainer
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: update trainer
exports.updateTrainer = async (req, res) => {
  try {

    const allowed = ["name", "photo", "designation", "experience", "specialization", "bio", "phone", "isActive"];

    const updates = {};
    for (const field of allowed) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    const trainer = await Trainer.findByIdAndUpdate(req.params.id, updates, { new: true });

    if (!trainer) {
      return res.status(404).json({ success: false, message: "Trainer not found" });
    }

    res.json({ success: true, message: "Trainer updated", trainer });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: delete trainer
exports.deleteTrainer = async (req, res) => {
  try {

    const trainer = await Trainer.findByIdAndDelete(req.params.id);

    if (!trainer) {
      return res.status(404).json({ success: false, message: "Trainer not found" });
    }

    res.json({ success: true, message: "Trainer deleted" });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
