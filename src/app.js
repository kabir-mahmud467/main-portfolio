import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import expressLayouts from "express-ejs-layouts";
import { registerCoreMiddleware } from "./core/middleware/security.middleware.js";
import { viewLocals } from "./core/middleware/viewLocals.middleware.js";
import { errorHandler, notFoundHandler } from "./core/errors/errorHandler.js";
import { pagesRouter } from "./modules/pages/pages.routes.js";
import { contactRouter } from "./modules/contact/contact.routes.js";
import { adminRouter } from "./modules/admin/admin.routes.js";
import { blogRouter } from "./modules/blog/blog.routes.js";
import { projectsRouter } from "./modules/projects/projects.routes.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { attachAuthenticatedUser } from "./core/middleware/auth.middleware.js";
import { csrfProtection } from "./core/middleware/csrf.middleware.js";
import { performanceHeaders } from "./core/middleware/performance.middleware.js";
import { ensureDatabaseConnection } from "./core/middleware/database.middleware.js";
import { cachedPage } from "./core/middleware/renderCache.middleware.js";
import { renderRss, renderSitemap } from "./modules/blog/blog.controller.js";
import { renderRobots } from "./modules/pages/pages.controller.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
app.set("layout", "layouts/main");
app.set("layout extractScripts", true);
app.set("layout extractStyles", true);

registerCoreMiddleware(app, express);
app.use(performanceHeaders);

app.use(express.static(path.join(__dirname, "public"), {
  etag: true,
  maxAge: "7d"
}));

app.use(ensureDatabaseConnection);
app.use(attachAuthenticatedUser);
app.use(csrfProtection);
app.use(viewLocals);

app.use("/", cachedPage({ ttl: 300 }), pagesRouter);
app.get("/robots.txt", cachedPage({ ttl: 3600 }), renderRobots);
app.use("/blog", cachedPage({ ttl: 300 }), blogRouter);
app.get("/sitemap.xml", cachedPage({ ttl: 3600 }), renderSitemap);
app.get("/rss.xml", cachedPage({ ttl: 3600 }), renderRss);
app.use("/projects", cachedPage({ ttl: 300 }), projectsRouter);
app.use("/tools", (req, res) => {
  res.redirect(301, `https://tools.kabirmahmud.xyz${req.path}`);
});
app.use("/contact", cachedPage({ ttl: 60 }), contactRouter);
app.use("/admin", authRouter);
app.use("/admin", adminRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
