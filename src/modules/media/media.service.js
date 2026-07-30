import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs/promises";
import sharp from "sharp";
import { Media } from "./media.model.js";
import { appConfig } from "../../config/app.config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.resolve(__dirname, "../../public/uploads");

export async function ensureUploadsDir() {
  try {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
  } catch {
    // directory exists
  }
}

function generateFilename(originalName) {
  const ext = path.extname(originalName);
  const name = path.basename(originalName, ext)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 40);
  const timestamp = Date.now();
  return `${name}-${timestamp}${ext}`;
}

export async function uploadFile(file) {
  await ensureUploadsDir();
  const filename = generateFilename(file.originalname);
  const filepath = path.join(UPLOADS_DIR, filename);

  let width = 0;
  let height = 0;
  let thumbnailUrl = "";

  if (file.mimetype.startsWith("image/")) {
    try {
      const metadata = await sharp(file.buffer).metadata();
      width = metadata.width || 0;
      height = metadata.height || 0;

      await sharp(file.buffer)
        .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
        .toFile(filepath);

      const thumbFilename = `thumb-${filename}`;
      await sharp(file.buffer)
        .resize(300, 300, { fit: "cover" })
        .toFile(path.join(UPLOADS_DIR, thumbFilename));

      thumbnailUrl = `/uploads/${thumbFilename}`;
    } catch {
      await fs.writeFile(filepath, file.buffer);
    }
  } else {
    await fs.writeFile(filepath, file.buffer);
  }

  const media = await Media.create({
    filename,
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    width,
    height,
    url: `/uploads/${filename}`,
    thumbnailUrl,
    type: file.mimetype.startsWith("image/") ? "image" : "other"
  });

  return media;
}

export function getAllMedia() {
  return Media.find().sort({ createdAt: -1 }).lean();
}

export async function deleteMedia(id) {
  const media = await Media.findById(id);
  if (!media) return null;

  try {
    await fs.unlink(path.join(UPLOADS_DIR, media.filename));
    if (media.thumbnailUrl) {
      const thumbFile = path.basename(media.thumbnailUrl);
      await fs.unlink(path.join(UPLOADS_DIR, thumbFile)).catch(() => {});
    }
  } catch {
    // file may not exist
  }

  return Media.findByIdAndDelete(id);
}

export async function updateMediaAlt(id, alt) {
  return Media.findByIdAndUpdate(id, { alt }, { new: true }).lean();
}
