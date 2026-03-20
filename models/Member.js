const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  phone: {
    type: Number,
    required: true,
    unique:true
  },

  email: {
    type: String,
    required:true,
    unique:true
  },

  age: {
    type: Number,
    required:true
  },

  gender: {
    type: String,
    required:true
  },

  address: {
    type: String,
    required:true
  },

  joinDate: {
    type: Date,
    default: Date.now,
    required:true
  },

  membershipEndDate: {
    type: Date,
  },

  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Plan",
  },

  photo: {
    type: String,
  },
  pending_amount:{
    type:Number,
    required:true,
    default:0
  }
},{ timestamps: true });

module.exports = mongoose.model("Member", memberSchema);