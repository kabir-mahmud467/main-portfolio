import { Tool } from "./tool.model.js";

export function findActiveTools({ limit = 24 } = {}) {
  return Tool.find({ status: "active" }).sort({ usageCount: -1, name: 1 }).limit(limit).lean();
}
