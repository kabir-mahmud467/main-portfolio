import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, trim: true, maxlength: 240 },
    type: { type: String, enum: ["blog", "project", "tool"], default: "blog", index: true }
  },
  { timestamps: true }
);

categorySchema.index({ slug: 1, type: 1 });

export const Category = mongoose.model("Category", categorySchema);
