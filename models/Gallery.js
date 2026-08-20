const mongoose = require("mongoose");

const gallerySchema = new mongoose.Schema({

  title: {
    type: String,
    required: true
  },

  description: {
    type: String
  },

  // Hosted image URL (project has no Cloudinary; disk uploads don't persist on Vercel)
  imageUrl: {
    type: String,
    required: true
  },

  category: {
    type: String,
    enum: ["Gym", "Equipment", "Training", "Trainers", "Events", "Members", "Facilities"],
    default: "Gym"
  },

  isActive: {
    type: Boolean,
    default: true,
    index: true
  }

}, { timestamps: true });

module.exports = mongoose.model("Gallery", gallerySchema);
