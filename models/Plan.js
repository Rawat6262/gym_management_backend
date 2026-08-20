const mongoose = require("mongoose");

const planSchema = new mongoose.Schema({

  planname: {
    type: String,
    required: true
  },

  duration: {
    type: Number,
    required: true
  },

  price: {
    type: Number,
    required: true
  },

  // ── Public-website fields (additive; older plans default sensibly) ──
  description: {
    type: String,
    default: ""
  },

  benefits: {
    type: [String],
    default: []
  },

  isActive: {
    type: Boolean,
    default: true,
    index: true
  }

}, { timestamps: true });

module.exports = mongoose.model("Plan", planSchema);