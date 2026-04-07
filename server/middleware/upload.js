const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");

const UPLOAD_DIR = path.join(__dirname, "../uploads");

// Disk storage for videos (ffmpeg needs a real file path)
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(UPLOAD_DIR, "videos");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ".mp4";
    cb(null, `${uuidv4()}${ext}`);
  },
});

// Memory storage for images (small files, no processing needed)
const imageStorage = multer.memoryStorage();

const videoFilter = (req, file, cb) => {
  if (/video\/(mp4|webm|ogg|quicktime|x-msvideo|avi)/.test(file.mimetype)) cb(null, true);
  else cb(new Error("Only video files are allowed"), false);
};

const imageFilter = (req, file, cb) => {
  if (/image\/(jpeg|jpg|png|webp|gif)/.test(file.mimetype)) cb(null, true);
  else cb(new Error("Only image files are allowed"), false);
};

// For video upload page: video + optional thumbnail
const uploadVideoFields = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const folder = file.fieldname === "video" ? "videos" : "thumbnails";
      const dir = path.join(UPLOAD_DIR, folder);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname) || (file.fieldname === "video" ? ".mp4" : ".jpg");
      cb(null, `${uuidv4()}${ext}`);
    },
  }),
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
}).fields([
  { name: "video", maxCount: 1 },
  { name: "thumbnail", maxCount: 1 },
]);

// For profile/banner images
const uploadImage = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const folder = file.fieldname === "banner" ? "banners" : "avatars";
      const dir = path.join(UPLOAD_DIR, folder);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname) || ".jpg";
      cb(null, `${uuidv4()}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: imageFilter,
});

module.exports = { uploadVideoFields, uploadImage };
