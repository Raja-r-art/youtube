const router = require("express").Router({ mergeParams: true });
const {
  getComments,
  getReplies,
  addComment,
  editComment,
  deleteComment,
} = require("../controllers/commentController");
const { protect } = require("../middleware/auth");

router.get("/", getComments);
router.post("/", protect, addComment);
router.get("/:commentId/replies", getReplies);
router.put("/:id", protect, editComment);
router.delete("/:id", protect, deleteComment);

module.exports = router;
