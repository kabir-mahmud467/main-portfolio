import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs/promises";
import crypto from "node:crypto";
import express from "express";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CACHE_DIR = path.join(__dirname, "../public/img-cache");

const inFlight = new Map();
const MAX_SOURCE_BYTES = 20 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 15000;
const DEFAULT_WIDTH = 1600;

function isValidSource(url, host) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }
    if (parsed.host === host) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

async function sendCached(res, filepath) {
  res.set("Cache-Control", "public, max-age=31536000, immutable");
  res.set("Content-Type", "image/jpeg");
  res.sendFile(filepath);
}

export const imageProxyRouter = express.Router();

imageProxyRouter.get("/", async (req, res) => {
  const source = req.query.url;
  const requestedWidth = Math.min(Math.max(Number(req.query.w) || DEFAULT_WIDTH, 16), 2400);

  if (typeof source !== "string" || !isValidSource(source, req.headers.host)) {
    return res.status(400).send("Invalid image URL");
  }

  const hash = crypto.createHash("sha1").update(source).digest("hex");
  const filename = `${hash}-w${requestedWidth}.jpg`;
  const filepath = path.join(CACHE_DIR, filename);

  try {
    await fs.access(filepath);
    return sendCached(res, filepath);
  } catch {
    // not cached yet — fetch below
  }

  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });

    let task = inFlight.get(filename);
    if (!task) {
      task = (async () => {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
        const response = await fetch(source, {
          signal: controller.signal,
          redirect: "follow",
          headers: {
            "user-agent": "Mozilla/5.0 (compatible; KabirMahmudImageProxy/1.0)"
          }
        });
        clearTimeout(timer);

        if (!response.ok) {
          throw new Error(`Upstream responded ${response.status}`);
        }

        const contentLength = Number(response.headers.get("content-length") || 0);
        if (contentLength > MAX_SOURCE_BYTES) {
          throw new Error("Source image too large");
        }

        const buffer = Buffer.from(await response.arrayBuffer());
        await sharp(buffer)
          .rotate()
          .resize(requestedWidth, requestedWidth, { fit: "inside", withoutEnlargement: true })
          .jpeg({ quality: 80, mozjpeg: true })
          .toFile(filepath);
      })();
      inFlight.set(filename, task);
      task.finally(() => inFlight.delete(filename));
    }

    await task;
    return sendCached(res, filepath);
  } catch {
    return res.status(502).send("Unable to fetch image");
  }
});
