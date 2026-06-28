import mongoose from "mongoose";

const toolSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 140 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true, trim: true, maxlength: 320 },
    category: { type: String, required: true, trim: true, index: true },
    icon: { type: String, default: null },
    moduleKey: { type: String, required: true, trim: true },
    status: { type: String, enum: ["active", "inactive"], default: "active", index: true },
    usageCount: { type: Number, default: 0 },
    seo: {
      title: { type: String, trim: true },
      description: { type: String, trim: true },
      canonicalUrl: { type: String, trim: true },
      ogImage: { type: String, trim: true },
      noIndex: { type: Boolean, default: false }
    }
  },
  { timestamps: true }
);

toolSchema.index({ slug: 1, status: 1 });
toolSchema.index({ category: 1, usageCount: -1 });

export const Tool = mongoose.model("Tool", toolSchema);
