const mongoose = require("mongoose");

const playlistSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    videos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }],
    visibility: { type: String, enum: ["public", "private"], default: "public" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Playlist", playlistSchema);
