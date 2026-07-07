import { createTool, deleteTool, findActiveTools, findAllTools, findToolById, findToolBySlug, updateTool } from "./tools.repository.js";
import { getToolDefinition, toolDefinitions } from "./tools.registry.js";
import { slugify } from "../../core/utils/slugify.js";

function normalizeToolPayload(body) {
  const status = body.status === "inactive" ? "inactive" : "active";
  const slug = slugify(body.slug || body.name);

  return {
    name: body.name,
    slug,
    description: body.description,
    category: body.category || "Utility",
    icon: body.icon || null,
    moduleKey: body.moduleKey || slug,
    status,
    usageCount: Number(body.usageCount || 0),
    seo: {
      title: body.seoTitle || body.name,
      description: body.seoDescription || body.description,
      canonicalUrl: body.canonicalUrl || "",
      ogImage: body.ogImage || "",
      noIndex: body.noIndex === "on"
    }
  };
}

export async function getToolsIndex() {
  try {
    const dbTools = await findActiveTools();
    const definitions = toolDefinitions.filter((tool) => !dbTools.some((entry) => entry.slug === tool.slug));
    return [...dbTools, ...definitions];
  } catch (error) {
    return toolDefinitions;
  }
}

export async function getToolPage(slug) {
  try {
    const dbTool = await findToolBySlug(slug);
    if (dbTool && dbTool.status === "active") {
      return {
        ...dbTool,
        route: `/tools/${dbTool.slug}`,
        view: "pages/tools/show",
        seo: {
          title: dbTool.seo?.title || dbTool.name,
          description: dbTool.seo?.description || dbTool.description,
          canonicalPath: `/tools/${dbTool.slug}`
        },
        schema: {
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: dbTool.name,
          applicationCategory: dbTool.category,
          operatingSystem: "Any",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }
        }
      };
    }
  } catch (error) {
    // Fall back to the built-in tool registry when the database is unavailable.
  }

  return getToolDefinition(slug);
}

export function getAdminTools() {
  return findAllTools();
}

export function getToolForAdmin(id) {
  return findToolById(id);
}

export function createToolEntry(body) {
  return createTool(normalizeToolPayload(body));
}

export function updateToolEntry(id, body) {
  return updateTool(id, normalizeToolPayload(body));
}

export function removeToolEntry(id) {
  return deleteTool(id);
}
