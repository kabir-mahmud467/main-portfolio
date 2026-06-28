import { findActiveTools } from "./tools.repository.js";
import { getToolDefinition, toolDefinitions } from "./tools.registry.js";

export async function getToolsIndex() {
  const dbTools = await findActiveTools();
  return dbTools.length ? dbTools : toolDefinitions;
}

export function getToolPage(slug) {
  return getToolDefinition(slug);
}
