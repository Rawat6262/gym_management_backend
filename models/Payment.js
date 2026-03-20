const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
    payment_serial_no:{
      type:String,
      required:true,
      unique:true
    },
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Member",
    required: true,
  },

  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Plan",
    required:true
  },
  plan_name:{
    type:String,
    required:true
  },

  amount: {
    type: Number,
    required: true
  },

  paymentDate: {
    type: Date,
    default: Date.now
  },

  nextDueDate: {
    type: Date
  },

  paymentMethod: {
    type: String,
    enum: ["Cash", "UPI", "Online","Card"]
  },
  pending:{
    type:Number,
    required:true
  }

},{ timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);