const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    url: { type: String, required: true },
    hlsUrl: { type: String },
    thumbnail: { type: String, required: true },
    duration: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    uploader: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    tags: [{ type: String }],
    category: {
      type: String,
      enum: ["Music", "Gaming", "Education", "Sports", "News", "Entertainment", "Technology", "Other"],
      default: "Other",
    },
    status: { type: String, enum: ["processing", "ready", "failed"], default: "processing" },
    visibility: { type: String, enum: ["public", "private", "unlisted"], default: "public" },
    isShort: { type: Boolean, default: false },
  },
  { timestamps: true }
);

videoSchema.index({ title: "text", tags: "text" });
videoSchema.index({ uploader: 1 });
videoSchema.index({ category: 1 });
videoSchema.index({ views: -1 });
videoSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Video", videoSchema);
