const Plan = require("../models/Plan");
const Trainer = require("../models/Trainer");
const Gallery = require("../models/Gallery");
const Testimonial = require("../models/Testimonial");
const WebsiteContent = require("../models/WebsiteContent");
const ContactMessage = require("../models/ContactMessage");

// Every handler here is unauthenticated: return ONLY content that is
// intentionally public, and only documents marked isActive.

// GET /api/public/website — singleton, created with defaults on first read
exports.getWebsiteContent = async (req, res) => {
  try {

    let content = await WebsiteContent.findOne({ key: "main" }).lean();

    if (!content) {
      content = (await WebsiteContent.create({ key: "main" })).toObject();
    }

    delete content.__v;

    res.json({ success: true, content });

  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// GET /api/public/plans — active plans only
exports.getPublicPlans = async (req, res) => {
  try {

    const plans = await Plan.find({ isActive: { $ne: false } })
      .select("planname duration price description benefits")
      .sort({ price: 1 })
      .lean();

    res.json({ success: true, plans });

  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// GET /api/public/trainers — active trainers, phone excluded on purpose
exports.getPublicTrainers = async (req, res) => {
  try {

    const trainers = await Trainer.find({ isActive: true })
      .select("name photo designation experience specialization bio")
      .sort({ createdAt: 1 })
      .lean();

    res.json({ success: true, trainers });

  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// GET /api/public/gallery — active images
exports.getPublicGallery = async (req, res) => {
  try {

    const images = await Gallery.find({ isActive: true })
      .select("title description imageUrl category")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, images });

  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// GET /api/public/testimonials — active testimonials
exports.getPublicTestimonials = async (req, res) => {
  try {

    const testimonials = await Testimonial.find({ isActive: true })
      .select("name message rating")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, testimonials });

  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// POST /api/public/contact — visitor contact form
exports.submitContact = async (req, res) => {
  try {

    const { name, email, phone, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email and message are required"
      });
    }

    if (String(message).length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Message is too long"
      });
    }

    await ContactMessage.create({ name, email, phone, message });

    res.status(201).json({
      success: true,
      message: "Thanks for reaching out! We will contact you soon."
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
