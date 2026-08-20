const mongoose = require("mongoose");

const trainerSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true
  },

  photo: {
    type: String
  },

  designation: {
    type: String
  },

  experience: {
    type: String
  },

  specialization: {
    type: String
  },

  bio: {
    type: String
  },

  phone: {
    type: String
  },

  isActive: {
    type: Boolean,
    default: true,
    index: true
  }

}, { timestamps: true });

module.exports = mongoose.model("Trainer", trainerSchema);
