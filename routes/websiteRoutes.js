const express = require("express");
const router = express.Router();

const { protect, adminOnly } = require("../middleware/authMiddleware");

const {
  getContent,
  updateContent,
  getTestimonials,
  addTestimonial,
  updateTestimonial,
  deleteTestimonial,
  getContactMessages,
  markMessageRead,
  deleteContactMessage
} = require("../controllers/websiteController");

// Website management is admin only (public view is /api/public/*)
router.use(protect, adminOnly);

router.get("/content", getContent);
router.put("/content", updateContent);

router.get("/testimonials", getTestimonials);
router.post("/testimonials", addTestimonial);
router.put("/testimonials/:id", updateTestimonial);
router.delete("/testimonials/:id", deleteTestimonial);

router.get("/messages", getContactMessages);
router.put("/messages/:id/read", markMessageRead);
router.delete("/messages/:id", deleteContactMessage);

module.exports = router;
