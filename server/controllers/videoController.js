const path = require("path");
const fs = require("fs");
const Video = require("../models/Video");
const User = require("../models/User");
const Comment = require("../models/Comment");
const { asyncHandler } = require("../middleware/error");
const { getVideoDuration, generateThumbnail } = require("../utils/ffmpeg");

exports.uploadVideo = asyncHandler(async (req, res) => {
  if (!req.files?.video?.[0]) return res.status(400).json({ message: "Video file required" });
  if (!req.body.title?.trim()) return res.status(400).json({ message: "Title is required" });

  const videoFile = req.files.video[0];
  const thumbFile = req.files?.thumbnail?.[0];

  // Build server-relative paths
  const videoRelUrl = `/uploads/videos/${videoFile.filename}`;
  const videoPath = videoFile.path;

  // Get duration from the actual file
  let duration = 0;
  try {
    duration = await getVideoDuration(videoPath);
  } catch (e) {
    console.warn("Could not get video duration:", e.message);
  }

  // Use uploaded thumbnail or auto-generate from video
  let thumbnailUrl = "";
  if (thumbFile) {
    thumbnailUrl = `/uploads/thumbnails/${thumbFile.filename}`;
  } else {
    try {
      thumbnailUrl = await generateThumbnail(videoPath);
    } catch (e) {
      console.warn("Thumbnail generation failed:", e.message);
    }
  }

  // Fallback placeholder thumbnail if generation failed
  if (!thumbnailUrl) {
    thumbnailUrl = `https://placehold.co/1280x720/1a1a1a/ffffff?text=${encodeURIComponent(req.body.title.trim().slice(0, 20))}`;
  }

  const { title, description, tags, category, visibility, isShort } = req.body;

  const video = await Video.create({
    title: title.trim(),
    description: description || "",
    url: videoRelUrl,
    thumbnail: thumbnailUrl,
    duration,
    uploader: req.user._id,
    tags: tags ? JSON.parse(tags) : [],
    category: category || "Other",
    visibility: visibility || "public",
    status: "ready",
    isShort: isShort === "true" || isShort === true,
  });

  await video.populate("uploader", "name avatar channelName");
  console.log(`✅ Video uploaded: "${video.title}" by ${req.user.name}`);
  res.status(201).json(video);
});

exports.getVideo = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id).populate(
    "uploader", "name avatar channelName subscribers"
  );
  if (!video) return res.status(404).json({ message: "Video not found" });
  if (
    video.visibility === "private" &&
    video.uploader._id.toString() !== req.user?._id?.toString()
  ) return res.status(403).json({ message: "Private video" });

  // Increment views
  await Video.findByIdAndUpdate(video._id, { $inc: { views: 1 } });

  // Add to watch history
  if (req.user) {
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { watchHistory: video._id },
    });
    await User.findByIdAndUpdate(req.user._id, {
      $push: { watchHistory: { $each: [video._id], $position: 0 } },
    });
  }

  const isSubscribed = req.user
    ? video.uploader.subscribers.includes(req.user._id)
    : false;

  res.json({
    video,
    isLiked: req.user ? video.likes.includes(req.user._id) : false,
    isDisliked: req.user ? video.dislikes.includes(req.user._id) : false,
    isSubscribed,
  });
});

exports.getFeed = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, category } = req.query;
  const filter = { status: "ready", visibility: "public", isShort: { $ne: true } };
  if (category) filter.category = category;

  const videos = await Video.find(filter)
    .sort("-createdAt")
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .populate("uploader", "name avatar channelName");

  res.json(videos);
});

exports.getTrending = asyncHandler(async (req, res) => {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const videos = await Video.find({
    status: "ready",
    visibility: "public",
    isShort: { $ne: true },
    createdAt: { $gte: since },
  })
    .sort("-views")
    .limit(20)
    .populate("uploader", "name avatar channelName");

  res.json(videos);
});

exports.likeVideo = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id);
  if (!video) return res.status(404).json({ message: "Video not found" });

  const userId = req.user._id;
  const liked = video.likes.includes(userId);

  if (liked) {
    video.likes.pull(userId);
  } else {
    video.likes.addToSet(userId);
    video.dislikes.pull(userId);
  }
  await video.save();
  res.json({ likes: video.likes.length, dislikes: video.dislikes.length, liked: !liked });
});

exports.dislikeVideo = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id);
  if (!video) return res.status(404).json({ message: "Video not found" });

  const userId = req.user._id;
  const disliked = video.dislikes.includes(userId);

  if (disliked) {
    video.dislikes.pull(userId);
  } else {
    video.dislikes.addToSet(userId);
    video.likes.pull(userId);
  }
  await video.save();
  res.json({ likes: video.likes.length, dislikes: video.dislikes.length, disliked: !disliked });
});

exports.deleteVideo = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id);
  if (!video) return res.status(404).json({ message: "Video not found" });
  if (
    video.uploader.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) return res.status(403).json({ message: "Not authorized" });

  // Delete local files
  const deleteFile = (url) => {
    if (!url) return;
    const filepath = path.join(__dirname, "../", url);
    if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
  };
  deleteFile(video.url);
  deleteFile(video.thumbnail);

  await Comment.deleteMany({ video: video._id });
  await video.deleteOne();
  res.json({ message: "Video deleted" });
});

exports.searchVideos = asyncHandler(async (req, res) => {
  const { q, category, sort = "relevance", page = 1, limit = 20 } = req.query;
  if (!q) return res.status(400).json({ message: "Query required" });

  const filter = {
    $text: { $search: q },
    status: "ready",
    visibility: "public",
  };
  if (category) filter.category = category;

  const sortMap = {
    relevance: { score: { $meta: "textScore" } },
    date: { createdAt: -1 },
    views: { views: -1 },
  };

  const videos = await Video.find(filter, { score: { $meta: "textScore" } })
    .sort(sortMap[sort] || sortMap.relevance)
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .populate("uploader", "name avatar channelName");

  res.json(videos);
});

exports.getSuggestedVideos = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id).select("tags category uploader");
  if (!video) return res.status(404).json({ message: "Video not found" });

  const suggested = await Video.find({
    _id: { $ne: video._id },
    status: "ready",
    visibility: "public",
    $or: [
      { tags: { $in: video.tags } },
      { category: video.category },
      { uploader: video.uploader },
    ],
  })
    .sort("-views")
    .limit(15)
    .populate("uploader", "name avatar channelName");

  res.json(suggested);
});

exports.updateVideo = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id);
  if (!video) return res.status(404).json({ message: "Video not found" });
  if (video.uploader.toString() !== req.user._id.toString())
    return res.status(403).json({ message: "Not authorized" });

  const { title, description, tags, category, visibility } = req.body;
  if (title) video.title = title;
  if (description !== undefined) video.description = description;
  if (tags) video.tags = JSON.parse(tags);
  if (category) video.category = category;
  if (visibility) video.visibility = visibility;

  await video.save();
  res.json(video);
});

exports.getShortsFeed = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const shorts = await Video.find({ status: "ready", visibility: "public", isShort: true })
    .sort("-createdAt")
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .populate("uploader", "name avatar channelName");
  res.json(shorts);
});
