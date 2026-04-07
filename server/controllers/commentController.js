const Comment = require("../models/Comment");
const { asyncHandler } = require("../middleware/error");

exports.getComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 20 } = req.query;

  const comments = await Comment.find({ video: videoId, parent: null })
    .sort("-createdAt")
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .populate("user", "name avatar");

  const total = await Comment.countDocuments({ video: videoId, parent: null });
  res.json({ comments, total });
});

exports.getReplies = asyncHandler(async (req, res) => {
  const replies = await Comment.find({ parent: req.params.commentId })
    .sort("createdAt")
    .populate("user", "name avatar");
  res.json(replies);
});

exports.addComment = asyncHandler(async (req, res) => {
  const { text, parent } = req.body;
  const comment = await Comment.create({
    text,
    user: req.user._id,
    video: req.params.videoId,
    parent: parent || null,
  });
  await comment.populate("user", "name avatar");
  res.status(201).json(comment);
});

exports.editComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) return res.status(404).json({ message: "Comment not found" });
  if (comment.user.toString() !== req.user._id.toString())
    return res.status(403).json({ message: "Not authorized" });

  comment.text = req.body.text;
  await comment.save();
  res.json(comment);
});

exports.deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) return res.status(404).json({ message: "Comment not found" });
  if (comment.user.toString() !== req.user._id.toString() && req.user.role !== "admin")
    return res.status(403).json({ message: "Not authorized" });

  await Comment.deleteMany({ parent: comment._id });
  await comment.deleteOne();
  res.json({ message: "Comment deleted" });
});
