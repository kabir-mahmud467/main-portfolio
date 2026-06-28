import { appConfig } from "../../config/app.config.js";
import { calculateReadingTime } from "../../core/utils/readingTime.js";
import { slugify } from "../../core/utils/slugify.js";
import { renderMarkdown } from "../../core/utils/markdown.js";
import { sanitizeHtml, stripHtml } from "../../core/utils/sanitizeHtml.js";
import {
  countPublishedPosts,
  createCategory,
  createPost,
  deleteCategory,
  deletePost,
  findAllCategories,
  findAllPosts,
  findPostBySlug,
  findPostForAdmin,
  findPublishedPosts,
  findPublishedPostsForFeed,
  findRelatedPosts,
  updatePost
} from "./blog.repository.js";

function normalizeList(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizePostPayload(body) {
  const status = body.status === "published" ? "published" : "draft";
  const publishedAt = status === "published" ? body.publishedAt || new Date() : null;
  const contentFormat = body.contentFormat === "html" ? "html" : "markdown";
  const readableContent = contentFormat === "html" ? stripHtml(body.content) : body.content;

  return {
    title: body.title,
    slug: slugify(body.slug || body.title),
    excerpt: body.excerpt,
    content: body.content,
    contentFormat,
    coverImage: body.coverImage || null,
    status,
    featured: body.featured === "on",
    categories: normalizeList(body.categories),
    tags: normalizeList(body.tags),
    readingTime: calculateReadingTime(readableContent),
    publishedAt,
    seo: {
      title: body.seoTitle || body.title,
      description: body.seoDescription || body.excerpt,
      canonicalUrl: body.canonicalUrl || "",
      ogImage: body.ogImage || body.coverImage || "",
      noIndex: body.noIndex === "on"
    }
  };
}

export async function getBlogIndex({ page = 1, search = "" }) {
  const limit = 9;
  const [posts, total] = await Promise.all([
    findPublishedPosts({ page, limit, search }),
    countPublishedPosts({ search })
  ]);

  return {
    posts,
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    search
  };
}

export async function getPublishedPost(slug) {
  const post = await findPostBySlug(slug);
  if (!post) return null;
  const relatedPosts = await findRelatedPosts(post);
  const isHtml = post.contentFormat === "html";
  return {
    post: {
      ...post,
      html: isHtml ? sanitizeHtml(post.content) : renderMarkdown(post.content)
    },
    relatedPosts
  };
}

export function getAdminPosts() {
  return findAllPosts();
}

export function getPostForAdmin(id) {
  return findPostForAdmin(id);
}

export function createBlogPost(body) {
  return createPost(normalizePostPayload(body));
}

export function updateBlogPost(id, body) {
  return updatePost(id, normalizePostPayload(body));
}

export function removeBlogPost(id) {
  return deletePost(id);
}

export function getCategories() {
  return findAllCategories();
}

export function addCategory(body) {
  return createCategory({
    name: body.name,
    slug: slugify(body.slug || body.name),
    description: body.description || "",
    type: "blog"
  });
}

export function removeCategory(id) {
  return deleteCategory(id);
}

export async function getSitemapUrls() {
  const posts = await findPublishedPostsForFeed(1000);
  return posts.map((post) => ({
    loc: `${appConfig.url}/blog/${post.slug}`,
    lastmod: post.updatedAt.toISOString()
  }));
}

export async function getRssFeed() {
  const posts = await findPublishedPostsForFeed();
  const items = posts
    .map(
      (post) => `
      <item>
        <title><![CDATA[${post.title}]]></title>
        <link>${appConfig.url}/blog/${post.slug}</link>
        <guid>${appConfig.url}/blog/${post.slug}</guid>
        <pubDate>${new Date(post.publishedAt || post.createdAt).toUTCString()}</pubDate>
        <description><![CDATA[${post.excerpt}]]></description>
      </item>`
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0">
    <channel>
      <title>${appConfig.name}</title>
      <link>${appConfig.url}</link>
      <description>Technical writing by Kabir Mahmud.</description>
      ${items}
    </channel>
  </rss>`;
}
