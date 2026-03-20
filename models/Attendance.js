const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({

  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Member",
    required: true
  },

  checkInTime: {
    type: Date,
    default: Date.now
  }

},{ timestamps: true });

module.exports = mongoose.model("Attendance", attendanceSchema);