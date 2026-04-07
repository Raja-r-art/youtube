const router = require("express").Router();
const {
  uploadVideo,
  getVideo,
  getFeed,
  getTrending,
  likeVideo,
  dislikeVideo,
  deleteVideo,
  searchVideos,
  getSuggestedVideos,
  updateVideo,
  getShortsFeed,
} = require("../controllers/videoController");
const { protect, optionalAuth } = require("../middleware/auth");
const { uploadVideoFields } = require("../middleware/upload");

router.get("/feed", getFeed);
router.get("/shorts", getShortsFeed);
router.get("/trending", getTrending);
router.get("/search", searchVideos);
router.post("/", protect, uploadVideoFields, uploadVideo);
router.get("/:id", optionalAuth, getVideo);
router.put("/:id", protect, updateVideo);
router.delete("/:id", protect, deleteVideo);
router.post("/:id/like", protect, likeVideo);
router.post("/:id/dislike", protect, dislikeVideo);
router.get("/:id/suggested", getSuggestedVideos);

module.exports = router;
