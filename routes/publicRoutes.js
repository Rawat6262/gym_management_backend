const express = require("express");
const router = express.Router();

const {
  getWebsiteContent,
  getPublicPlans,
  getPublicTrainers,
  getPublicGallery,
  getPublicTestimonials,
  submitContact
} = require("../controllers/publicController");

// No auth on purpose: these serve the public website
router.get("/website", getWebsiteContent);
router.get("/plans", getPublicPlans);
router.get("/trainers", getPublicTrainers);
router.get("/gallery", getPublicGallery);
router.get("/testimonials", getPublicTestimonials);
router.post("/contact", submitContact);

module.exports = router;
