const mongoose = require("mongoose");

const testimonialSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true
  },

  message: {
    type: String,
    required: true
  },

  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 5
  },

  isActive: {
    type: Boolean,
    default: true,
    index: true
  }

}, { timestamps: true });

module.exports = mongoose.model("Testimonial", testimonialSchema);
