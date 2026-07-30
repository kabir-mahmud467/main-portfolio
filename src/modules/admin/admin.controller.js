import { buildMeta } from "../../core/utils/metaBuilder.js";
import { Post } from "../blog/blog.model.js";
import { Category } from "../blog/category.model.js";
import { Project } from "../projects/project.model.js";
import { Tool } from "../tools/tool.model.js";
import { ContactMessage } from "../contact/contact.model.js";
import { Media } from "../media/media.model.js";

export async function renderAdminDashboard(req, res, next) {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    const [
      posts, drafts, categories, projects, tools, newMessages,
      totalMessages, totalMedia, recentPosts, recentMessages,
      postsLast30, messagesLast30, totalViews
    ] = await Promise.all([
      Post.countDocuments({ status: "published" }),
      Post.countDocuments({ status: "draft" }),
      Category.countDocuments({ type: "blog" }),
      Project.countDocuments(),
      Tool.countDocuments(),
      ContactMessage.countDocuments({ status: "new" }),
      ContactMessage.countDocuments(),
      Media.countDocuments(),
      Post.find({ status: "published" }).sort({ publishedAt: -1 }).limit(5).select("title slug publishedAt views").lean(),
      ContactMessage.find().sort({ createdAt: -1 }).limit(5).select("name subject createdAt status").lean(),
      Post.countDocuments({ status: "published", publishedAt: { $gte: thirtyDaysAgo } }),
      ContactMessage.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Post.aggregate([{ $group: { _id: null, total: { $sum: "$views" } } }])
    ]);

    const viewCount = totalViews.length ? totalViews[0].total : 0;

    res.render("admin/dashboard", {
      layout: "layouts/admin",
      title: "Admin Dashboard",
      meta: buildMeta(req, { title: "Admin Dashboard", description: "Administrative dashboard for managing content, projects, tools, and platform settings.", noIndex: true }),
      stats: [
        { label: "Published Posts", value: posts, change: postsLast30, icon: "posts" },
        { label: "Drafts", value: drafts, icon: "draft" },
        { label: "Total Views", value: viewCount, icon: "views" },
        { label: "Categories", value: categories, icon: "categories" },
        { label: "Projects", value: projects, icon: "projects" },
        { label: "Tools", value: tools, icon: "tools" },
        { label: "New Messages", value: newMessages, total: totalMessages, icon: "messages" },
        { label: "Media Files", value: totalMedia, icon: "media" }
      ],
      recentPosts,
      recentMessages
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
    meta: buildMeta(req, { title, description, noIndex: true })
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

export async function renderAdminAnalytics(req, res) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

  const [
    totalPosts, totalProjects, totalTools,
    totalMessages, totalMedia,
    postsLast30, messagesLast30,
    messageStatusCounts, totalViews
  ] = await Promise.all([
    Post.countDocuments({ status: "published" }),
    Project.countDocuments({ status: "published" }),
    Tool.countDocuments({ status: "active" }),
    ContactMessage.countDocuments(),
    Media.countDocuments(),
    Post.countDocuments({ publishedAt: { $gte: thirtyDaysAgo } }),
    ContactMessage.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    ContactMessage.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Post.aggregate([{ $group: { _id: null, total: { $sum: "$views" } } }])
  ]);

  const messagesByStatus = {};
  messageStatusCounts.forEach(({ _id, count }) => { messagesByStatus[_id] = count; });
  const viewCount = totalViews.length ? totalViews[0].total : 0;

  const topPosts = await Post.find({ status: "published" }).sort({ views: -1 }).limit(5).select("title views publishedAt").lean();

  res.render("admin/analytics", {
    layout: "layouts/admin",
    title: "Website Analytics",
    meta: buildMeta(req, { title: "Website Analytics", noIndex: true }),
    metrics: {
      totalPosts,
      totalProjects,
      totalTools,
      totalMessages,
      totalMedia,
      totalViews: viewCount,
      postsLast30,
      messagesLast30,
      newMessages: messagesByStatus.new || 0,
      readMessages: messagesByStatus.read || 0,
      archivedMessages: messagesByStatus.archived || 0
    },
    topPosts
  });
}
