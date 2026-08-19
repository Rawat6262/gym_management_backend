const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

  name: {
    type: String
  },

  email: {
    type: String,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  phone: {
    type: String
  },

  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user"
  },

  // ── Membership fields (users with role "user" ARE the gym members) ──
  age: {
    type: Number
  },

  gender: {
    type: String
  },

  address: {
    type: String
  },

  joinDate: {
    type: Date,
    default: Date.now
  },

  membershipEndDate: {
    type: Date
  },

  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Plan"
  },

  photo: {
    type: String
  },

  pending_amount: {
    type: Number,
    default: 0
  },

  isVerified: {
    type: Boolean,
    default: false
  },

  otp: {
    type: String
  },

  otpExpire: {
    type: Date
  }

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
