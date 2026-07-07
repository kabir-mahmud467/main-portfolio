import { Tool } from "./tool.model.js";

export function findActiveTools({ limit = 24 } = {}) {
  return Tool.find({ status: "active" }).sort({ usageCount: -1, name: 1 }).limit(limit).lean();
}

export function findAllTools() {
  return Tool.find().sort({ createdAt: -1 }).lean();
}

export function findToolById(id) {
  return Tool.findById(id).lean();
}

export function findToolBySlug(slug) {
  return Tool.findOne({ slug }).lean();
}

export function createTool(payload) {
  return Tool.create(payload);
}

export function updateTool(id, payload) {
  return Tool.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
}

export function deleteTool(id) {
  return Tool.findByIdAndDelete(id);
}
