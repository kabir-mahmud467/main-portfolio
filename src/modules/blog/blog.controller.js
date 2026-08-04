import { buildMeta } from "../../core/utils/metaBuilder.js";
import { appConfig } from "../../config/app.config.js";
import { buildSitemapXml } from "../../core/utils/sitemap.js";
import { renderCache } from "../../core/utils/renderCache.js";
import { Project } from "../projects/project.model.js";
import { Tool } from "../tools/tool.model.js";
import { toolDefinitions } from "../tools/tools.registry.js";
import {
  addCategory,
  createBlogPost,
  getAdminPosts,
  getBlogCategories,
  getBlogIndex,
  getCategories,
  getCategoryPage,
  getPostForAdmin,
  getPublishedPost,
  getRssFeed,
  getSitemapUrls,
  removeBlogPost,
  removeCategory,
  updateBlogPost
} from "./blog.service.js";

export async function renderBlogIndex(req, res, next) {
  try {
    const page = Math.max(1, Number(req.query.page || 1));
    const data = await getBlogIndex({ page, search: req.query.search || "" });
    res.render("pages/blog/index", {
      title: "Blog",
      meta: buildMeta(req, {
        title: "Tech Blog",
        description: "Technical writing on software architecture, backend systems, web development, and practical engineering."
      }),
      ...data
    });
  } catch (error) {
    next(error);
  }
}

export async function renderBlogCategories(req, res, next) {
  try {
    const categories = await getBlogCategories();
    res.render("pages/blog/categories", {
      title: "Blog Categories",
      meta: buildMeta(req, {
        title: "Blog Categories",
        description: "Browse the blog by topic: Linux commands, Termux tools, server administration, shell automation, and software engineering."
      }),
      categories,
      breadcrumbs: [
        { label: "Home", href: "/" },
        { label: "Blog", href: "/blog" },
        { label: "Categories" }
      ]
    });
  } catch (error) {
    next(error);
  }
}

export async function renderBlogCategory(req, res, next) {
  try {
    const page = Math.max(1, Number(req.query.page || 1));
    const data = await getCategoryPage({ slug: req.params.slug, page });
    if (!data) {
      const error = new Error("Category not found.");
      error.statusCode = 404;
      return next(error);
    }

    res.render("pages/blog/category", {
      title: `${data.category.name} Archives`,
      meta: buildMeta(req, {
        title: `${data.category.name} — Blog Archives`,
        description: `All blog articles about ${data.category.name.toLowerCase()}: guides, tutorials, and engineering notes with ${data.category.count} posts.`,
        canonical: `${appConfig.url}/blog/category/${data.category.slug}`,
        type: "collection"
      }),
      ...data,
      breadcrumbs: [
        { label: "Home", href: "/" },
        { label: "Blog", href: "/blog" },
        { label: data.category.name }
      ]
    });
  } catch (error) {
    next(error);
  }
}

export async function renderBlogPost(req, res, next) {
  try {
    const data = await getPublishedPost(req.params.slug);
    if (!data) {
      const error = new Error("Post not found.");
      error.statusCode = 404;
      return next(error);
    }

    res.render("pages/blog/show", {
      title: data.post.title,
      meta: buildMeta(req, {
        title: data.post.seo?.title || data.post.title,
        description: data.post.seo?.description || data.post.excerpt,
        canonical: data.post.seo?.canonicalUrl || `${appConfig.url}/blog/${data.post.slug}`,
        image: data.post.seo?.ogImage || data.post.coverImage || "/images/og-default.png",
        type: "article",
        noIndex: data.post.seo?.noIndex || false,
        schema: {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: data.post.title,
          description: data.post.excerpt,
          image: data.post.coverImage ? [data.post.coverImage] : undefined,
          datePublished: data.post.publishedAt,
          dateModified: data.post.updatedAt,
          author: {
            "@type": "Person",
            name: "Kabir Mahmud",
            url: appConfig.url
          },
          mainEntityOfPage: `${appConfig.url}/blog/${data.post.slug}`
        }
      }),
      ...data,
      breadcrumbs: [
        { label: "Home", href: "/" },
        { label: "Blog", href: "/blog" },
        { label: data.post.title }
      ]
    });
  } catch (error) {
    next(error);
  }
}

export async function renderAdminPosts(req, res, next) {
  try {
    res.render("admin/posts/index", {
      layout: "layouts/admin",
      title: "Posts",
      meta: buildMeta(req, { title: "Posts", noIndex: true }),
      posts: await getAdminPosts()
    });
  } catch (error) {
    next(error);
  }
}

export function renderNewPost(req, res) {
  res.render("admin/posts/form", {
    layout: "layouts/admin",
    title: "Create Post",
    meta: buildMeta(req, { title: "Create Post", noIndex: true }),
    post: null,
    action: "/admin/posts",
    submitLabel: "Create Post"
  });
}

export async function handleCreatePost(req, res, next) {
  try {
    await createBlogPost(req.body);
    renderCache.flush();
    req.flash("success", "Post created.");
    res.redirect("/admin/posts");
  } catch (error) {
    next(error);
  }
}

export async function renderEditPost(req, res, next) {
  try {
    const post = await getPostForAdmin(req.params.id);
    if (!post) {
      const error = new Error("Post not found.");
      error.statusCode = 404;
      return next(error);
    }
    res.render("admin/posts/form", {
      layout: "layouts/admin",
      title: "Edit Post",
      meta: buildMeta(req, { title: "Edit Post", noIndex: true }),
      post,
      action: `/admin/posts/${post._id}`,
      submitLabel: "Save Changes"
    });
  } catch (error) {
    next(error);
  }
}

export async function handleUpdatePost(req, res, next) {
  try {
    await updateBlogPost(req.params.id, req.body);
    renderCache.flush();
    req.flash("success", "Post updated.");
    res.redirect("/admin/posts");
  } catch (error) {
    next(error);
  }
}

export async function handleDeletePost(req, res, next) {
  try {
    await removeBlogPost(req.params.id);
    renderCache.flush();
    req.flash("success", "Post deleted.");
    res.redirect("/admin/posts");
  } catch (error) {
    next(error);
  }
}

export async function renderAdminCategories(req, res, next) {
  try {
    res.render("admin/categories/index", {
      layout: "layouts/admin",
      title: "Categories",
      meta: buildMeta(req, { title: "Categories", noIndex: true }),
      categories: await getCategories()
    });
  } catch (error) {
    next(error);
  }
}

export async function handleCreateCategory(req, res, next) {
  try {
    await addCategory(req.body);
    renderCache.flush();
    req.flash("success", "Category created.");
    res.redirect("/admin/categories");
  } catch (error) {
    next(error);
  }
}

export async function handleDeleteCategory(req, res, next) {
  try {
    await removeCategory(req.params.id);
    renderCache.flush();
    req.flash("success", "Category deleted.");
    res.redirect("/admin/categories");
  } catch (error) {
    next(error);
  }
}

export async function renderSitemap(req, res, next) {
  try {
    const requestedOrigin = `${req.protocol}://${req.get("host")}`;
    const resolvedBaseUrl = (appConfig.url && !/^(https?:\/\/)?(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?(?:\/|$)/i.test(appConfig.url)
      ? appConfig.url
      : requestedOrigin);

    const [blogResult, projectResult, toolResult, categoryResult] = await Promise.allSettled([
      getSitemapUrls(),
      Project.find({ status: "published" }).select("slug updatedAt publishedAt").lean(),
      Tool.find({ status: "active" }).select("slug updatedAt").lean(),
      getBlogCategories()
    ]);

    const urls = blogResult.status === "fulfilled" ? blogResult.value : [];
    const projects = projectResult.status === "fulfilled" ? projectResult.value : [];
    const dbTools = toolResult.status === "fulfilled" ? toolResult.value : [];
    const categories = categoryResult.status === "fulfilled" ? categoryResult.value : [];

    const staticUrls = ["", "/about", "/contact", "/blog", "/projects", "/privacy-policy", "/terms", "/dmca"].map((path) => ({
      loc: `${resolvedBaseUrl}${path}`,
      lastmod: new Date().toISOString()
    }));
    const projectUrls = projects
      .filter((project) => project?.slug)
      .map((project) => ({
        loc: `${resolvedBaseUrl}/projects/${project.slug}`,
        lastmod: (project.updatedAt || project.publishedAt || new Date()).toISOString()
      }));
    const toolUrls = [
      ...dbTools
        .filter((tool) => tool?.slug)
        .map((tool) => ({
          loc: `https://tools.kabirmahmud.xyz/${tool.slug}`,
          lastmod: (tool.updatedAt || new Date()).toISOString()
        })),
      ...toolDefinitions.map((tool) => ({
        loc: `${tool.route}`,
        lastmod: new Date().toISOString()
      }))
    ];

    const categoryUrls = categories
      .filter((category) => category?.slug)
      .map((category) => ({
        loc: `${resolvedBaseUrl}/blog/category/${category.slug}`,
        lastmod: new Date().toISOString()
      }));

    const xml = buildSitemapXml({ staticUrls, blogUrls: urls, projectUrls, toolUrls, categoryUrls, baseUrl: resolvedBaseUrl });
    res.type("application/xml").send(xml);
  } catch (error) {
    next(error);
  }
}

export async function renderRss(req, res, next) {
  try {
    res.type("application/rss+xml").send(await getRssFeed());
  } catch (error) {
    next(error);
  }
}
