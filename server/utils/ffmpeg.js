const ffmpeg = require("fluent-ffmpeg");
const ffprobeInstaller = require("@ffprobe-installer/ffprobe");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

ffmpeg.setFfprobePath(ffprobeInstaller.path);

// Try to locate ffmpeg on PATH automatically
try {
  const { execSync } = require("child_process");
  const ffmpegPath = execSync("where ffmpeg", { encoding: "utf8" }).trim().split(/\r?\n/)[0];
  if (ffmpegPath) ffmpeg.setFfmpegPath(ffmpegPath);
} catch {
  // ffmpeg not found – thumbnail generation will gracefully degrade
  console.warn("⚠️  ffmpeg not found on PATH – auto-thumbnail generation disabled");
}

const UPLOAD_DIR = path.join(__dirname, "../uploads");

// Get video duration in seconds
const getVideoDuration = (filepath) => {
  return new Promise((resolve) => {
    ffmpeg.ffprobe(filepath, (err, metadata) => {
      if (err) return resolve(0);
      resolve(Math.floor(metadata.format.duration || 0));
    });
  });
};

// Generate thumbnail from video at 1 second mark
const generateThumbnail = (videoPath) => {
  return new Promise((resolve) => {
    const filename = `${uuidv4()}.jpg`;
    const outputDir = path.join(UPLOAD_DIR, "thumbnails");
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    ffmpeg(videoPath)
      .screenshots({
        timestamps: ["00:00:01"],
        filename,
        folder: outputDir,
        size: "1280x720",
      })
      .on("end", () => resolve(`/uploads/thumbnails/${filename}`))
      .on("error", (err) => {
        console.warn("Thumbnail generation failed:", err.message);
        resolve(""); // gracefully return empty – controller will use placeholder
      });
  });
};

module.exports = { getVideoDuration, generateThumbnail };
