import { calculateReadingTime } from "../../core/utils/readingTime.js";
import { renderMarkdown } from "../../core/utils/markdown.js";
import { slugify } from "../../core/utils/slugify.js";
import {
  createProject,
  deleteProject,
  findAllProjects,
  findProjectBySlug,
  findProjectForAdmin,
  findPublishedProjects,
  updateProject
} from "./projects.repository.js";

function normalizeList(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeProjectPayload(body) {
  const status = body.status === "published" ? "published" : "draft";
  return {
    title: body.title,
    slug: slugify(body.slug || body.title),
    summary: body.summary,
    description: body.description,
    coverImage: body.coverImage || null,
    gallery: normalizeList(body.gallery),
    techStack: normalizeList(body.techStack),
    categories: normalizeList(body.categories),
    links: {
      github: body.github || "",
      live: body.live || "",
      caseStudy: body.caseStudy || ""
    },
    status,
    featured: body.featured === "on",
    order: Number(body.order || 0),
    publishedAt: status === "published" ? body.publishedAt || new Date() : null,
    seo: {
      title: body.seoTitle || body.title,
      description: body.seoDescription || body.summary,
      canonicalUrl: body.canonicalUrl || "",
      ogImage: body.ogImage || body.coverImage || "",
      noIndex: body.noIndex === "on"
    }
  };
}

export async function getProjectsIndex({ search = "", category = "" } = {}) {
  return findPublishedProjects({ search, category });
}

export async function getPublishedProject(slug) {
  const project = await findProjectBySlug(slug);
  if (!project) return null;
  return {
    ...project,
    html: renderMarkdown(project.description),
    readingTime: calculateReadingTime(project.description)
  };
}

export function getAdminProjects() {
  return findAllProjects();
}

export function getProjectForAdmin(id) {
  return findProjectForAdmin(id);
}

export function createPortfolioProject(body) {
  return createProject(normalizeProjectPayload(body));
}

export function updatePortfolioProject(id, body) {
  return updateProject(id, normalizeProjectPayload(body));
}

export function removePortfolioProject(id) {
  return deleteProject(id);
}
