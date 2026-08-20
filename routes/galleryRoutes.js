const express = require("express");
const router = express.Router();

const { protect, adminOnly } = require("../middleware/authMiddleware");

const {
  getGallery,
  addImage,
  updateImage,
  deleteImage
} = require("../controllers/galleryController");

// Gallery management is admin only (public view is /api/public/gallery)
router.use(protect, adminOnly);

router.get("/", getGallery);
router.post("/", addImage);
router.put("/:id", updateImage);
router.delete("/:id", deleteImage);

module.exports = router;
