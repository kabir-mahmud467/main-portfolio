import { appConfig } from "../../config/app.config.js";
import { buildMeta } from "../../core/utils/metaBuilder.js";
import { getToolPage, getToolsIndex } from "./tools.service.js";

export async function renderToolsIndex(req, res, next) {
  try {
    const tools = await getToolsIndex();
    res.render("pages/tools/index", {
      title: "Tools",
      meta: buildMeta(req, {
        title: "Free Online Tools",
        description: "Free online tools for developers, writers, SEO workflows, and everyday technical tasks."
      }),
      tools
    });
  } catch (error) {
    next(error);
  }
}

export async function renderToolPage(req, res, next) {
  try {
    const tool = getToolPage(req.params.slug);

    if (!tool) {
      const error = new Error("Tool not found.");
      error.statusCode = 404;
      return next(error);
    }

    res.render(tool.view, {
      title: tool.name,
      meta: buildMeta(req, {
        title: tool.seo.title,
        description: tool.seo.description,
        canonical: `${appConfig.url}${tool.seo.canonicalPath}`
      }),
      tool,
      schemaJson: JSON.stringify({
        ...tool.schema,
        url: `${appConfig.url}${tool.route}`,
        description: tool.description
      })
    });
  } catch (error) {
    next(error);
  }
}

export function createToolPageController(slug) {
  return (req, res, next) => {
    req.params.slug = slug;
    return renderToolPage(req, res, next);
  };
}
