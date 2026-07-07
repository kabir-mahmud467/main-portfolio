import { appConfig } from "../../config/app.config.js";
import { buildMeta } from "../../core/utils/metaBuilder.js";
import {
  createToolEntry,
  getAdminTools,
  getToolForAdmin,
  getToolPage,
  getToolsIndex,
  removeToolEntry,
  updateToolEntry
} from "./tools.service.js";

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

export async function renderAdminTools(req, res, next) {
  try {
    res.render("admin/tools/index", {
      layout: "layouts/admin",
      title: "Tools",
      meta: buildMeta(req, { title: "Tools", noIndex: true }),
      tools: await getAdminTools()
    });
  } catch (error) {
    next(error);
  }
}

export function renderNewTool(req, res) {
  res.render("admin/tools/form", {
    layout: "layouts/admin",
    title: "Create Tool",
    meta: buildMeta(req, { title: "Create Tool", noIndex: true }),
    tool: null,
    action: "/admin/tools",
    submitLabel: "Create Tool"
  });
}

export async function handleCreateTool(req, res, next) {
  try {
    await createToolEntry(req.body);
    req.flash("success", "Tool created.");
    res.redirect("/admin/tools");
  } catch (error) {
    next(error);
  }
}

export async function renderEditTool(req, res, next) {
  try {
    const tool = await getToolForAdmin(req.params.id);
    if (!tool) {
      const error = new Error("Tool not found.");
      error.statusCode = 404;
      return next(error);
    }
    res.render("admin/tools/form", {
      layout: "layouts/admin",
      title: "Edit Tool",
      meta: buildMeta(req, { title: "Edit Tool", noIndex: true }),
      tool,
      action: `/admin/tools/${tool._id}`,
      submitLabel: "Save Tool"
    });
  } catch (error) {
    next(error);
  }
}

export async function handleUpdateTool(req, res, next) {
  try {
    await updateToolEntry(req.params.id, req.body);
    req.flash("success", "Tool updated.");
    res.redirect("/admin/tools");
  } catch (error) {
    next(error);
  }
}

export async function handleDeleteTool(req, res, next) {
  try {
    await removeToolEntry(req.params.id);
    req.flash("success", "Tool deleted.");
    res.redirect("/admin/tools");
  } catch (error) {
    next(error);
  }
}
