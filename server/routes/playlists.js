const router = require("express").Router();
const {
  createPlaylist,
  getUserPlaylists,
  getPlaylist,
  addToPlaylist,
  removeFromPlaylist,
  deletePlaylist,
} = require("../controllers/playlistController");
const { protect, optionalAuth } = require("../middleware/auth");

router.post("/", protect, createPlaylist);
router.get("/user/:userId", getUserPlaylists);
router.get("/:id", optionalAuth, getPlaylist);
router.post("/:id/videos", protect, addToPlaylist);
router.delete("/:id/videos/:videoId", protect, removeFromPlaylist);
router.delete("/:id", protect, deletePlaylist);

module.exports = router;
