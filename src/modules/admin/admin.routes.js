import { Router } from "express";
import { requireAuth, requireRole } from "../../core/middleware/auth.middleware.js";
import {
  renderAdminAnalytics,
  renderAdminDashboard
} from "./admin.controller.js";
import {
  handleCreateCategory,
  handleCreatePost,
  handleDeleteCategory,
  handleDeletePost,
  handleUpdatePost,
  renderAdminCategories,
  renderAdminPosts,
  renderEditPost,
  renderNewPost
} from "../blog/blog.controller.js";
import { categoryValidationRules, idParamRule, postValidationRules } from "../blog/blog.validation.js";
import { validateRequest } from "../../core/middleware/validate.middleware.js";
import {
  handleCreateProject,
  handleDeleteProject,
  handleUpdateProject,
  renderAdminProjects,
  renderEditProject,
  renderNewProject
} from "../projects/projects.controller.js";
import { projectIdParamRule, projectValidationRules } from "../projects/projects.validation.js";
import {
  handleCreateTool,
  handleDeleteTool,
  handleUpdateTool,
  renderAdminTools,
  renderEditTool,
  renderNewTool
} from "../tools/tools.controller.js";
import { toolIdParamRule, toolValidationRules } from "../tools/tools.validation.js";
import { mediaRouter } from "../media/media.routes.js";
import { settingsRouter } from "../settings/settings.routes.js";

export const adminRouter = Router();

adminRouter.use(requireAuth, requireRole("admin"));

adminRouter.get("/", renderAdminDashboard);
adminRouter.get("/posts", renderAdminPosts);
adminRouter.get("/posts/new", renderNewPost);
adminRouter.post("/posts", postValidationRules, validateRequest, handleCreatePost);
adminRouter.get("/posts/:id/edit", idParamRule, validateRequest, renderEditPost);
adminRouter.post("/posts/:id", idParamRule, postValidationRules, validateRequest, handleUpdatePost);
adminRouter.post("/posts/:id/delete", idParamRule, validateRequest, handleDeletePost);
adminRouter.get("/categories", renderAdminCategories);
adminRouter.post("/categories", categoryValidationRules, validateRequest, handleCreateCategory);
adminRouter.post("/categories/:id/delete", idParamRule, validateRequest, handleDeleteCategory);
adminRouter.get("/projects", renderAdminProjects);
adminRouter.get("/projects/new", renderNewProject);
adminRouter.post("/projects", projectValidationRules, validateRequest, handleCreateProject);
adminRouter.get("/projects/:id/edit", projectIdParamRule, validateRequest, renderEditProject);
adminRouter.post("/projects/:id", projectIdParamRule, projectValidationRules, validateRequest, handleUpdateProject);
adminRouter.post("/projects/:id/delete", projectIdParamRule, validateRequest, handleDeleteProject);
adminRouter.get("/tools", renderAdminTools);
adminRouter.get("/tools/new", renderNewTool);
adminRouter.post("/tools", toolValidationRules, validateRequest, handleCreateTool);
adminRouter.get("/tools/:id/edit", toolIdParamRule, validateRequest, renderEditTool);
adminRouter.post("/tools/:id", toolIdParamRule, toolValidationRules, validateRequest, handleUpdateTool);
adminRouter.post("/tools/:id/delete", toolIdParamRule, validateRequest, handleDeleteTool);
adminRouter.use("/media", mediaRouter);
adminRouter.get("/analytics", renderAdminAnalytics);
adminRouter.use("/settings", settingsRouter);
