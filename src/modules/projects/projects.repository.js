import { Project } from "./project.model.js";

export function findPublishedProjects({ limit = 12, search = "", category = "" } = {}) {
  const query = { status: "published" };
  if (search) query.$text = { $search: search };
  if (category) query.categories = category;
  return Project.find(query).sort({ featured: -1, order: 1, publishedAt: -1 }).limit(limit).lean();
}

export function findProjectBySlug(slug) {
  return Project.findOne({ slug, status: "published" }).lean();
}

export function findAllProjects() {
  return Project.find().sort({ updatedAt: -1 }).lean();
}

export function findProjectForAdmin(id) {
  return Project.findById(id).lean();
}

export function createProject(payload) {
  return Project.create(payload);
}

export function updateProject(id, payload) {
  return Project.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
}

export function deleteProject(id) {
  return Project.findByIdAndDelete(id);
}
