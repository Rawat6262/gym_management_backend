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
  }

});

module.exports = mongoose.model("Plan", planSchema);