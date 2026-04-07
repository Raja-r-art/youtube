const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const UPLOAD_DIR = path.join(__dirname, "../uploads");

// Ensure directories exist
["videos", "thumbnails", "avatars", "banners"].forEach((dir) => {
  const p = path.join(UPLOAD_DIR, dir);
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
});

const uploadToLocal = async (buffer, mimetype, folder = "uploads") => {
  const ext = mimetype.split("/")[1].replace("quicktime", "mov");
  const filename = `${uuidv4()}.${ext}`;
  const filepath = path.join(UPLOAD_DIR, folder, filename);
  fs.writeFileSync(filepath, buffer);
  const url = `/uploads/${folder}/${filename}`;
  return { key: `${folder}/${filename}`, url };
};

const deleteFromLocal = (key) => {
  try {
    const filepath = path.join(UPLOAD_DIR, key);
    if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
  } catch (e) {
    console.error("Delete error:", e.message);
  }
};

module.exports = { uploadToLocal, deleteFromLocal };
