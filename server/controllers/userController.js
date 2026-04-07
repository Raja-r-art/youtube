const path = require("path");
const fs = require("fs");
const User = require("../models/User");
const Video = require("../models/Video");
const { asyncHandler } = require("../middleware/error");

exports.getChannel = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password -email");
  if (!user) return res.status(404).json({ message: "Channel not found" });

  const videos = await Video.find({
    uploader: user._id,
    status: "ready",
    visibility: "public",
  })
    .sort("-createdAt")
    .select("title thumbnail views duration createdAt likes");

  res.json({ user, videos });
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, bio, channelName } = req.body;
  const updates = {};

  if (name?.trim()) updates.name = name.trim();
  if (bio !== undefined) updates.bio = bio;
  if (channelName?.trim()) {
    const exists = await User.findOne({
      channelName: channelName.trim(),
      _id: { $ne: req.user._id },
    });
    if (exists) return res.status(400).json({ message: "Channel name already taken" });
    updates.channelName = channelName.trim();
  }

  if (req.files?.avatar?.[0]) {
    updates.avatar = `/uploads/avatars/${req.files.avatar[0].filename}`;
  }
  if (req.files?.banner?.[0]) {
    updates.channelBanner = `/uploads/banners/${req.files.banner[0].filename}`;
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select("-password");
  console.log(`✅ Profile updated: ${user.name}`);
  res.json(user);
});

exports.subscribe = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (id === req.user._id.toString())
    return res.status(400).json({ message: "Cannot subscribe to yourself" });

  const target = await User.findById(id);
  if (!target) return res.status(404).json({ message: "User not found" });

  const isSubscribed = target.subscribers.includes(req.user._id);

  if (isSubscribed) {
    await User.findByIdAndUpdate(id, { $pull: { subscribers: req.user._id } });
    await User.findByIdAndUpdate(req.user._id, { $pull: { subscriptions: id } });
    console.log(`🔕 ${req.user.name} unsubscribed from ${target.name}`);
    res.json({ subscribed: false, subscriberCount: target.subscribers.length - 1 });
  } else {
    await User.findByIdAndUpdate(id, { $addToSet: { subscribers: req.user._id } });
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { subscriptions: id } });
    console.log(`🔔 ${req.user.name} subscribed to ${target.name}`);
    res.json({ subscribed: true, subscriberCount: target.subscribers.length + 1 });
  }
});

exports.getSubscriptionFeed = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("subscriptions");
  const videos = await Video.find({
    uploader: { $in: user.subscriptions },
    status: "ready",
    visibility: "public",
  })
    .sort("-createdAt")
    .limit(30)
    .populate("uploader", "name avatar channelName");

  res.json(videos);
});

exports.getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: "watchHistory",
    select: "title thumbnail views duration createdAt uploader",
    populate: { path: "uploader", select: "name avatar channelName" },
    options: { limit: 50 },
  });
  res.json(user.watchHistory || []);
});

exports.clearWatchHistory = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { $set: { watchHistory: [] } });
  res.json({ message: "Watch history cleared" });
});
