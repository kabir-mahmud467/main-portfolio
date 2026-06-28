import { Router } from "express";
import { renderProjectShow, renderProjectsIndex } from "./projects.controller.js";

export const projectsRouter = Router();

projectsRouter.get("/", renderProjectsIndex);
projectsRouter.get("/:slug", renderProjectShow);
