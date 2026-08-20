const Gallery = require("../models/Gallery");

// Admin: list all images (including inactive)
exports.getGallery = async (req, res) => {
  try {

    const images = await Gallery.find().sort({ createdAt: -1 });

    res.json({ success: true, images });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: add image (hosted URL)
exports.addImage = async (req, res) => {
  try {

    const { title, description, imageUrl, category, isActive } = req.body;

    if (!title || !imageUrl) {
      return res.status(400).json({
        success: false,
        message: "Title and image URL are required"
      });
    }

    const image = await Gallery.create({ title, description, imageUrl, category, isActive });

    res.status(201).json({
      success: true,
      message: "Image added",
      image
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: update image details / toggle active
exports.updateImage = async (req, res) => {
  try {

    const allowed = ["title", "description", "imageUrl", "category", "isActive"];

    const updates = {};
    for (const field of allowed) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    const image = await Gallery.findByIdAndUpdate(req.params.id, updates, { new: true });

    if (!image) {
      return res.status(404).json({ success: false, message: "Image not found" });
    }

    res.json({ success: true, message: "Image updated", image });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: delete image
exports.deleteImage = async (req, res) => {
  try {

    const image = await Gallery.findByIdAndDelete(req.params.id);

    if (!image) {
      return res.status(404).json({ success: false, message: "Image not found" });
    }

    res.json({ success: true, message: "Image deleted" });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
