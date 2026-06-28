import { Post } from "./blog.model.js";
import { Category } from "./category.model.js";

export function findPublishedPosts({ page = 1, limit = 9, search = "" } = {}) {
  const query = { status: "published" };
  if (search) {
    query.$text = { $search: search };
  }
  return Post.find(query)
    .sort({ featured: -1, publishedAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();
}

export function countPublishedPosts({ search = "" } = {}) {
  const query = { status: "published" };
  if (search) query.$text = { $search: search };
  return Post.countDocuments(query);
}

export function findPostBySlug(slug) {
  return Post.findOne({ slug, status: "published" }).lean();
}

export function findRelatedPosts(post, limit = 3) {
  return Post.find({
    _id: { $ne: post._id },
    status: "published",
    $or: [{ tags: { $in: post.tags || [] } }, { categories: { $in: post.categories || [] } }]
  })
    .sort({ publishedAt: -1 })
    .limit(limit)
    .lean();
}

export function findAllPosts() {
  return Post.find().sort({ updatedAt: -1 }).lean();
}

export function findPostForAdmin(id) {
  return Post.findById(id).lean();
}

export function createPost(payload) {
  return Post.create(payload);
}

export function updatePost(id, payload) {
  return Post.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
}

export function deletePost(id) {
  return Post.findByIdAndDelete(id);
}

export function findPublishedPostsForFeed(limit = 20) {
  return Post.find({ status: "published" }).sort({ publishedAt: -1 }).limit(limit).lean();
}

export function findAllCategories() {
  return Category.find({ type: "blog" }).sort({ name: 1 }).lean();
}

export function createCategory(payload) {
  return Category.create(payload);
}

export function deleteCategory(id) {
  return Category.findByIdAndDelete(id);
}
