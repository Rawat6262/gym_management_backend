const WebsiteContent = require("../models/WebsiteContent");
const Testimonial = require("../models/Testimonial");
const ContactMessage = require("../models/ContactMessage");

// ── Website content (singleton) ────────────────────────────────────────────

// Admin: read current content (creates defaults on first read)
exports.getContent = async (req, res) => {
  try {

    let content = await WebsiteContent.findOne({ key: "main" });

    if (!content) {
      content = await WebsiteContent.create({ key: "main" });
    }

    res.json({ success: true, content });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: update content
exports.updateContent = async (req, res) => {
  try {

    const allowed = [
      "gymName", "tagline", "heroTitle", "about", "address",
      "phone", "whatsapp", "email", "mapUrl",
      "instagram", "facebook", "youtube",
      "whyChooseUs", "facilities"
    ];

    const updates = {};
    for (const field of allowed) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    const content = await WebsiteContent.findOneAndUpdate(
      { key: "main" },
      updates,
      { new: true, upsert: true }
    );

    res.json({ success: true, message: "Website content updated", content });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Testimonials ───────────────────────────────────────────────────────────

exports.getTestimonials = async (req, res) => {
  try {

    const testimonials = await Testimonial.find().sort({ createdAt: -1 });

    res.json({ success: true, testimonials });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addTestimonial = async (req, res) => {
  try {

    const { name, message, rating, isActive } = req.body;

    if (!name || !message) {
      return res.status(400).json({
        success: false,
        message: "Name and message are required"
      });
    }

    const testimonial = await Testimonial.create({ name, message, rating, isActive });

    res.status(201).json({ success: true, message: "Testimonial added", testimonial });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateTestimonial = async (req, res) => {
  try {

    const allowed = ["name", "message", "rating", "isActive"];

    const updates = {};
    for (const field of allowed) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, updates, { new: true });

    if (!testimonial) {
      return res.status(404).json({ success: false, message: "Testimonial not found" });
    }

    res.json({ success: true, message: "Testimonial updated", testimonial });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteTestimonial = async (req, res) => {
  try {

    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);

    if (!testimonial) {
      return res.status(404).json({ success: false, message: "Testimonial not found" });
    }

    res.json({ success: true, message: "Testimonial deleted" });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Contact messages ───────────────────────────────────────────────────────

exports.getContactMessages = async (req, res) => {
  try {

    const messages = await ContactMessage.find().sort({ createdAt: -1 });

    res.json({ success: true, messages });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markMessageRead = async (req, res) => {
  try {

    const message = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    res.json({ success: true, message: "Marked as read" });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteContactMessage = async (req, res) => {
  try {

    const message = await ContactMessage.findByIdAndDelete(req.params.id);

    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    res.json({ success: true, message: "Message deleted" });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
