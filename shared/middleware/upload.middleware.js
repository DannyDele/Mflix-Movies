const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const AppError = require("../utils/AppError");

const UPLOAD_ROOT = path.join(__dirname, "../../uploads");

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const createUploader = (subfolder, { maxCount = 5, maxSizeMB = 5 } = {}) => {
  const dest = path.join(UPLOAD_ROOT, subfolder);
  ensureDir(dest);

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, dest),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${uuidv4()}${ext}`);
    },
  });

  const fileFilter = (_req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.includes(ext)) {
      return cb(new AppError("Only image files are allowed", 400));
    }
    cb(null, true);
  };

  return multer({
    storage,
    fileFilter,
    limits: { fileSize: maxSizeMB * 1024 * 1024 },
  }).array("images", maxCount);
};

const toPublicUrl = (req, subfolder, filename) => {
  const base = `${req.protocol}://${req.get("host")}`;
  return `${base}/uploads/${subfolder}/${filename}`;
};

module.exports = { createUploader, toPublicUrl, UPLOAD_ROOT };
