import { appConfig } from "../../config/app.config.js";

export function viewLocals(req, res, next) {
  res.locals.app = {
    name: appConfig.name,
    url: appConfig.url,
    year: new Date().getFullYear()
  };
  res.locals.user = req.user || null;
  res.locals.csrfToken = req.csrfToken ? req.csrfToken() : "";
  res.locals.currentPath = req.path;
  res.locals.flash = {
    success: req.flash("success"),
    error: req.flash("error")
  };
  res.locals.meta = {
    title: "Kabir Mahmud",
    description: "Portfolio, technical writing, projects, and useful online tools by Kabir Mahmud.",
    canonical: `${appConfig.url}${req.originalUrl === "/" ? "" : req.originalUrl}`
  };
  next();
}
