const Playlist = require("../models/Playlist");
const { asyncHandler } = require("../middleware/error");

exports.createPlaylist = asyncHandler(async (req, res) => {
  const playlist = await Playlist.create({ ...req.body, owner: req.user._id });
  res.status(201).json(playlist);
});

exports.getUserPlaylists = asyncHandler(async (req, res) => {
  const playlists = await Playlist.find({ owner: req.params.userId })
    .populate("videos", "title thumbnail duration views");
  res.json(playlists);
});

exports.getPlaylist = asyncHandler(async (req, res) => {
  const playlist = await Playlist.findById(req.params.id)
    .populate("owner", "name avatar")
    .populate({ path: "videos", populate: { path: "uploader", select: "name avatar" } });
  if (!playlist) return res.status(404).json({ message: "Playlist not found" });
  if (playlist.visibility === "private" && playlist.owner._id.toString() !== req.user?._id?.toString())
    return res.status(403).json({ message: "Private playlist" });
  res.json(playlist);
});

exports.addToPlaylist = asyncHandler(async (req, res) => {
  const playlist = await Playlist.findOne({ _id: req.params.id, owner: req.user._id });
  if (!playlist) return res.status(404).json({ message: "Playlist not found" });
  playlist.videos.addToSet(req.body.videoId);
  await playlist.save();
  res.json(playlist);
});

exports.removeFromPlaylist = asyncHandler(async (req, res) => {
  const playlist = await Playlist.findOne({ _id: req.params.id, owner: req.user._id });
  if (!playlist) return res.status(404).json({ message: "Playlist not found" });
  playlist.videos.pull(req.params.videoId);
  await playlist.save();
  res.json(playlist);
});

exports.deletePlaylist = asyncHandler(async (req, res) => {
  await Playlist.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
  res.json({ message: "Playlist deleted" });
});
