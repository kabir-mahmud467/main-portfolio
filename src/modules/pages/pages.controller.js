import { buildMeta } from "../../core/utils/metaBuilder.js";
import { appConfig } from "../../config/app.config.js";
import { Post } from "../blog/blog.model.js";
import { Project } from "../projects/project.model.js";
import { toolDefinitions } from "../tools/tools.registry.js";
import { logger } from "../../core/utils/logger.js";

const fallbackProjects = [
  {
    title: "Personal Brand Platform",
    summary: "A scalable content, tools, and portfolio system for long-term technical authority.",
    stack: ["Node.js", "Express", "MongoDB"],
    href: "/projects/personal-brand-platform"
  },
  {
    title: "Developer Utilities",
    summary: "Free browser-first tools designed for quick everyday engineering workflows.",
    stack: ["EJS", "Tailwind", "Vanilla JS"],
    href: "/tools"
  },
  {
    title: "Technical Writing Hub",
    summary: "Deep practical notes on web architecture, backend systems, and product engineering.",
    stack: ["SEO", "Content", "Systems"],
    href: "/blog"
  }
];

const skills = [
  "Software Architecture",
  "Backend Engineering",
  "Full-stack Development",
  "MongoDB Data Modeling",
  "SEO Content Systems",
  "Admin Dashboards",
  "Developer Tools",
  "Performance Optimization"
];

const techStack = ["Node.js", "Express", "MongoDB", "Mongoose", "EJS", "Tailwind CSS", "Vanilla JS", "Security Middleware"];

const experience = [
  {
    role: "Software Architect",
    detail: "Designs modular MVC systems, admin platforms, publishing workflows, and scalable web foundations."
  },
  {
    role: "Full-stack Engineer",
    detail: "Builds server-rendered products with fast pages, clean data models, and practical user interfaces."
  },
  {
    role: "Technical Publisher",
    detail: "Connects blog content, project proof, and free tools into one search-friendly personal brand system."
  }
];

const statistics = [
  { label: "Core Modules", value: "5+" },
  { label: "Free Tools", value: "14" },
  { label: "Stack", value: "SSR" },
  { label: "Architecture", value: "MVC" }
];

const testimonials = [
  {
    quote: "Clean systems thinking, thoughtful UI decisions, and a strong bias toward maintainable delivery.",
    name: "Product Partner"
  },
  {
    quote: "A practical engineering approach that balances speed, structure, security, and long-term growth.",
    name: "Technical Collaborator"
  }
];

export async function renderHomePage(req, res, next) {
  try {
    let dbProjects = [];
    let latestPosts = [];

    try {
      [dbProjects, latestPosts] = await Promise.all([
        Project.find({ status: "published", featured: true }).sort({ order: 1, publishedAt: -1 }).limit(3).lean(),
        Post.find({ status: "published" }).sort({ publishedAt: -1 }).limit(3).lean()
      ]);
    } catch (error) {
      logger.warn("Homepage content query failed; rendering fallback content", {
        error: error.message
      });
    }

    const featuredProjects = dbProjects.length
      ? dbProjects.map((project) => ({
          title: project.title,
          summary: project.summary,
          stack: project.techStack || [],
          href: `/projects/${project.slug}`
        }))
      : fallbackProjects;

    res.render("pages/home", {
      title: "Home",
      meta: buildMeta(req, {
        title: "Premium Developer Portfolio, Blog, Projects and Tools",
        description:
          "Kabir Mahmud builds scalable web platforms, developer tools, technical content systems, and production-ready full-stack applications.",
        schema: {
          "@context": "https://schema.org",
          "@type": "Person",
          name: "Kabir Mahmud",
          url: appConfig.url,
          jobTitle: "Software Architect and Full-Stack Engineer",
          sameAs: [],
          knowsAbout: skills
        }
      }),
      featuredProjects,
      featuredTools: toolDefinitions.slice(0, 6),
      latestPosts,
      skills,
      techStack,
      experience,
      statistics,
      testimonials
    });
  } catch (error) {
    next(error);
  }
}

export function renderAboutPage(req, res) {
  res.render("pages/about", {
    title: "About",
    meta: buildMeta(req, {
      title: "About",
      description:
        "Learn about Kabir Mahmud's engineering philosophy, platform architecture, projects, and technical focus."
    })
  });
}

export function renderRobots(req, res) {
  res.type("text/plain").send(`User-agent: *
Allow: /
Disallow: /admin/

Sitemap: ${appConfig.url}/sitemap.xml
`);
}
