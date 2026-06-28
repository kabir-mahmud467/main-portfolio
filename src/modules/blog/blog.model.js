import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 180 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    excerpt: { type: String, required: true, trim: true, maxlength: 320 },
    content: { type: String, required: true },
    contentFormat: { type: String, enum: ["markdown", "html"], default: "markdown" },
    coverImage: { type: String, default: null },
    status: { type: String, enum: ["draft", "published", "archived"], default: "draft", index: true },
    featured: { type: Boolean, default: false, index: true },
    categories: [{ type: String, trim: true, index: true }],
    tags: [{ type: String, trim: true, index: true }],
    seo: {
      title: { type: String, trim: true },
      description: { type: String, trim: true },
      canonicalUrl: { type: String, trim: true },
      ogImage: { type: String, trim: true },
      noIndex: { type: Boolean, default: false }
    },
    readingTime: { type: Number, default: 1 },
    views: { type: Number, default: 0 },
    publishedAt: { type: Date, index: true }
  },
  { timestamps: true }
);

postSchema.index({ slug: 1, status: 1 });
postSchema.index({ title: "text", excerpt: "text", content: "text" });
postSchema.index({ status: 1, featured: 1, publishedAt: -1 });

export const Post = mongoose.model("Post", postSchema);
