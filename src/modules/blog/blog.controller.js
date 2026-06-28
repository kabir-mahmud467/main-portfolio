import { buildMeta } from "../../core/utils/metaBuilder.js";
import { appConfig } from "../../config/app.config.js";
import { Project } from "../projects/project.model.js";
import { toolDefinitions } from "../tools/tools.registry.js";
import {
  addCategory,
  createBlogPost,
  getAdminPosts,
  getBlogIndex,
  getCategories,
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
    req.flash("success", "Post updated.");
    res.redirect("/admin/posts");
  } catch (error) {
    next(error);
  }
}

export async function handleDeletePost(req, res, next) {
  try {
    await removeBlogPost(req.params.id);
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
    req.flash("success", "Category created.");
    res.redirect("/admin/categories");
  } catch (error) {
    next(error);
  }
}

export async function handleDeleteCategory(req, res, next) {
  try {
    await removeCategory(req.params.id);
    req.flash("success", "Category deleted.");
    res.redirect("/admin/categories");
  } catch (error) {
    next(error);
  }
}

export async function renderSitemap(req, res, next) {
  try {
    const urls = await getSitemapUrls();
    const projects = await Project.find({ status: "published" }).select("slug updatedAt").lean();
    const staticUrls = ["", "/about", "/contact", "/blog", "/projects", "/tools"].map((path) => ({
      loc: `${appConfig.url}${path}`,
      lastmod: new Date().toISOString()
    }));
    const projectUrls = projects.map((project) => ({
      loc: `${appConfig.url}/projects/${project.slug}`,
      lastmod: project.updatedAt.toISOString()
    }));
    const toolUrls = toolDefinitions.map((tool) => ({
      loc: `${appConfig.url}${tool.route}`,
      lastmod: new Date().toISOString()
    }));
    res.type("application/xml").send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticUrls, ...urls, ...projectUrls, ...toolUrls].map((url) => `<url><loc>${url.loc}</loc><lastmod>${url.lastmod}</lastmod></url>`).join("\n")}
</urlset>`);
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
