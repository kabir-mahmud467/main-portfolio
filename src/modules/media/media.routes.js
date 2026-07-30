import { Router } from "express";
import multer from "multer";
import { renderAdminMedia, handleUpload, handleDeleteMedia, handleUpdateAlt } from "./media.controller.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml", "application/pdf"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Allowed: JPEG, PNG, WebP, GIF, SVG, PDF."));
    }
  }
});

export const mediaRouter = Router();

mediaRouter.get("/", renderAdminMedia);
mediaRouter.post("/upload", upload.single("file"), handleUpload);
mediaRouter.post("/:id/delete", handleDeleteMedia);
mediaRouter.post("/:id/alt", handleUpdateAlt);
