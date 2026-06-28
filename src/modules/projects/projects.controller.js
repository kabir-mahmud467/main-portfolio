import { appConfig } from "../../config/app.config.js";
import { buildMeta } from "../../core/utils/metaBuilder.js";
import {
  createPortfolioProject,
  getAdminProjects,
  getProjectForAdmin,
  getProjectsIndex,
  getPublishedProject,
  removePortfolioProject,
  updatePortfolioProject
} from "./projects.service.js";

export async function renderProjectsIndex(req, res, next) {
  try {
    const projects = await getProjectsIndex({
      search: req.query.search || "",
      category: req.query.category || ""
    });
    res.render("pages/projects/index", {
      title: "Projects",
      meta: buildMeta(req, {
        title: "Projects",
        description: "Selected software projects, architecture work, experiments, and case studies by Kabir Mahmud."
      }),
      projects,
      search: req.query.search || "",
      category: req.query.category || ""
    });
  } catch (error) {
    next(error);
  }
}

export async function renderProjectShow(req, res, next) {
  try {
    const project = await getPublishedProject(req.params.slug);
    if (!project) {
      const error = new Error("Project not found.");
      error.statusCode = 404;
      return next(error);
    }

    res.render("pages/projects/show", {
      title: project.title,
      meta: buildMeta(req, {
        title: project.seo?.title || project.title,
        description: project.seo?.description || project.summary,
        canonical: project.seo?.canonicalUrl || `${appConfig.url}/projects/${project.slug}`,
        image: project.seo?.ogImage || project.coverImage || "/images/og-default.png",
        noIndex: project.seo?.noIndex || false,
        schema: {
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          name: project.title,
          description: project.summary,
          url: `${appConfig.url}/projects/${project.slug}`,
          image: project.coverImage || undefined,
          programmingLanguage: project.techStack || [],
          author: {
            "@type": "Person",
            name: "Kabir Mahmud",
            url: appConfig.url
          }
        }
      }),
      project,
      breadcrumbs: [
        { label: "Home", href: "/" },
        { label: "Projects", href: "/projects" },
        { label: project.title }
      ]
    });
  } catch (error) {
    next(error);
  }
}

export async function renderAdminProjects(req, res, next) {
  try {
    res.render("admin/projects/index", {
      layout: "layouts/admin",
      title: "Projects",
      meta: buildMeta(req, { title: "Projects", noIndex: true }),
      projects: await getAdminProjects()
    });
  } catch (error) {
    next(error);
  }
}

export function renderNewProject(req, res) {
  res.render("admin/projects/form", {
    layout: "layouts/admin",
    title: "Create Project",
    meta: buildMeta(req, { title: "Create Project", noIndex: true }),
    project: null,
    action: "/admin/projects",
    submitLabel: "Create Project"
  });
}

export async function handleCreateProject(req, res, next) {
  try {
    await createPortfolioProject(req.body);
    req.flash("success", "Project created.");
    res.redirect("/admin/projects");
  } catch (error) {
    next(error);
  }
}

export async function renderEditProject(req, res, next) {
  try {
    const project = await getProjectForAdmin(req.params.id);
    if (!project) {
      const error = new Error("Project not found.");
      error.statusCode = 404;
      return next(error);
    }
    res.render("admin/projects/form", {
      layout: "layouts/admin",
      title: "Edit Project",
      meta: buildMeta(req, { title: "Edit Project", noIndex: true }),
      project,
      action: `/admin/projects/${project._id}`,
      submitLabel: "Save Project"
    });
  } catch (error) {
    next(error);
  }
}

export async function handleUpdateProject(req, res, next) {
  try {
    await updatePortfolioProject(req.params.id, req.body);
    req.flash("success", "Project updated.");
    res.redirect("/admin/projects");
  } catch (error) {
    next(error);
  }
}

export async function handleDeleteProject(req, res, next) {
  try {
    await removePortfolioProject(req.params.id);
    req.flash("success", "Project deleted.");
    res.redirect("/admin/projects");
  } catch (error) {
    next(error);
  }
}
