const express = require("express");
const router = express.Router();

const { protect, adminOnly } = require("../middleware/authMiddleware");

const {
  addMember,
  getMembers,
  updateMember,
  deleteMember,
  getExpiredMembers,
  expiringSoon
} = require("../controllers/membercontroller");

// Members are managed by admin only
router.use(protect, adminOnly);

router.post("/add-member", addMember);
router.get("/getMembers", getMembers);
router.put("/:id", updateMember);
router.delete("/:id", deleteMember);
router.get("/expired", getExpiredMembers);
router.get("/expiring-soon", expiringSoon);

module.exports = router;
