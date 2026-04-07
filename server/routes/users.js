const router = require("express").Router();
const {
  getChannel,
  updateProfile,
  subscribe,
  getSubscriptionFeed,
  getWatchHistory,
  clearWatchHistory,
} = require("../controllers/userController");
const { protect } = require("../middleware/auth");
const { uploadImage } = require("../middleware/upload");

router.get("/feed", protect, getSubscriptionFeed);
router.get("/history", protect, getWatchHistory);
router.delete("/history", protect, clearWatchHistory);
router.put(
  "/profile",
  protect,
  uploadImage.fields([{ name: "avatar", maxCount: 1 }, { name: "banner", maxCount: 1 }]),
  updateProfile
);
router.get("/:id", getChannel);
router.post("/:id/subscribe", protect, subscribe);

module.exports = router;
