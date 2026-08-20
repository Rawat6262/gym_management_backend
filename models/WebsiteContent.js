const mongoose = require("mongoose");

// Singleton document that holds all admin-editable website content.
// The public site reads it via GET /api/public/website.
const websiteContentSchema = new mongoose.Schema({

  // There is only ever one document; this key enforces it
  key: {
    type: String,
    default: "main",
    unique: true
  },

  gymName: {
    type: String,
    default: "PRO FITNESS UNISEX GYM"
  },

  tagline: {
    type: String,
    default: "Train Like a Pro"
  },

  heroTitle: {
    type: String,
    default: "Build Strength. Build Discipline. Build Yourself."
  },

  about: {
    type: String,
    default:
      "PRO FITNESS UNISEX GYM is a fitness-focused gym in Ludhiana designed for people who want to improve their strength, fitness, endurance and overall lifestyle.\n\nWith a motivating training environment, modern workout equipment and a supportive atmosphere, PRO FITNESS UNISEX GYM provides a place where beginners and experienced fitness enthusiasts can train consistently and work toward their goals.\n\nOur philosophy is simple: Train Like a Pro.\n\nWhether your goal is muscle building, strength development, weight management, general fitness or improving your physical performance, our gym is built to help you stay consistent and make progress."
  },

  address: {
    type: String,
    default:
      "Eastman Road, Itkaran Dhillon Market, near Nirmal Singh Councilor Office, Ludhiana, Punjab - 141016"
  },

  // Placeholder contact data — admin must replace with real values
  phone: {
    type: String,
    default: ""
  },

  whatsapp: {
    type: String,
    default: ""
  },

  email: {
    type: String,
    default: ""
  },

  mapUrl: {
    type: String,
    default: ""
  },

  instagram: {
    type: String,
    default: ""
  },

  facebook: {
    type: String,
    default: ""
  },

  youtube: {
    type: String,
    default: ""
  },

  whyChooseUs: {
    type: [String],
    default: [
      "Professional Training Environment",
      "Quality Workout Equipment",
      "Supportive Fitness Community",
      "Personal Training Support",
      "Strength & Conditioning",
      "Fitness-Focused Environment"
    ]
  },

  facilities: {
    type: [String],
    default: [
      "Weight Training",
      "Cardio Training",
      "Strength Training",
      "Free Weights",
      "Workout Machines",
      "Personal Training Area",
      "Functional Training Area"
    ]
  }

}, { timestamps: true });

module.exports = mongoose.model("WebsiteContent", websiteContentSchema);
