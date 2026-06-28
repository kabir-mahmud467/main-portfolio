import { buildMeta } from "../../core/utils/metaBuilder.js";
import { Post } from "../blog/blog.model.js";
import { Category } from "../blog/category.model.js";
import { Project } from "../projects/project.model.js";
import { Tool } from "../tools/tool.model.js";
import { ContactMessage } from "../contact/contact.model.js";

export async function renderAdminDashboard(req, res, next) {
  try {
    const [posts, drafts, categories, projects, tools, messages] = await Promise.all([
      Post.countDocuments({ status: "published" }),
      Post.countDocuments({ status: "draft" }),
      Category.countDocuments({ type: "blog" }),
      Project.countDocuments(),
      Tool.countDocuments(),
      ContactMessage.countDocuments({ status: "new" })
    ]);

  res.render("admin/dashboard", {
    layout: "layouts/admin",
    title: "Admin Dashboard",
    meta: buildMeta(req, {
      title: "Admin Dashboard",
      description: "Administrative dashboard for managing content, projects, tools, and platform settings.",
      noIndex: true
    }),
    stats: [
      { label: "Published Posts", value: posts },
      { label: "Drafts", value: drafts },
      { label: "Categories", value: categories },
      { label: "Projects", value: projects },
      { label: "Tools", value: tools },
      { label: "New Messages", value: messages }
    ]
  });
  } catch (error) {
    next(error);
  }
}

function renderAdminSection(req, res, { title, description }) {
  res.render("admin/section", {
    layout: "layouts/admin",
    title,
    description,
    meta: buildMeta(req, {
      title,
      description,
      noIndex: true
    })
  });
}

export function renderAdminProjects(req, res) {
  renderAdminSection(req, res, {
    title: "Projects",
    description: "Manage project showcases, case studies, tech stacks, links, ordering, and SEO."
  });
}

export function renderAdminTools(req, res) {
  renderAdminSection(req, res, {
    title: "Tools",
    description: "Manage free online tools, categories, status, usage counters, and SEO landing pages."
  });
}

export function renderAdminMedia(req, res) {
  renderAdminSection(req, res, {
    title: "Media Library",
    description: "Manage featured images, alt text, uploads, and reusable visual assets."
  });
}

export function renderAdminAnalytics(req, res) {
  renderAdminSection(req, res, {
    title: "Website Analytics",
    description: "Monitor visitors, content performance, popular tools, referrals, and conversion signals."
  });
}

export function renderAdminSettings(req, res) {
  renderAdminSection(req, res, {
    title: "Settings",
    description: "Configure site metadata, social profiles, analytics keys, SEO defaults, and platform behavior."
  });
}
