import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    alt: { type: String, default: "", trim: true },
    url: { type: String, required: true },
    thumbnailUrl: { type: String, default: "" },
    type: { type: String, enum: ["image", "document", "other"], default: "image", index: true }
  },
  { timestamps: true }
);

mediaSchema.index({ createdAt: -1 });

export const Media = mongoose.model("Media", mediaSchema);
