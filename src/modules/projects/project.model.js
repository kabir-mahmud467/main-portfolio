import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 180 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    summary: { type: String, required: true, trim: true, maxlength: 320 },
    description: { type: String, required: true },
    coverImage: { type: String, default: null },
    gallery: [{ type: String, trim: true }],
    techStack: [{ type: String, trim: true }],
    categories: [{ type: String, trim: true, index: true }],
    links: {
      live: { type: String, trim: true },
      github: { type: String, trim: true },
      caseStudy: { type: String, trim: true }
    },
    status: { type: String, enum: ["draft", "published"], default: "draft", index: true },
    featured: { type: Boolean, default: false, index: true },
    order: { type: Number, default: 0 },
    seo: {
      title: { type: String, trim: true },
      description: { type: String, trim: true },
      canonicalUrl: { type: String, trim: true },
      ogImage: { type: String, trim: true },
      noIndex: { type: Boolean, default: false }
    },
    publishedAt: { type: Date, index: true }
  },
  { timestamps: true }
);

projectSchema.index({ slug: 1, status: 1 });
projectSchema.index({ order: 1, publishedAt: -1 });
projectSchema.index({ title: "text", summary: "text", description: "text", techStack: "text" });

export const Project = mongoose.model("Project", projectSchema);
