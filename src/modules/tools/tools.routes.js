import { Router } from "express";
import { createToolPageController, renderToolsIndex } from "./tools.controller.js";
import { toolDefinitions } from "./tools.registry.js";

export const toolsRouter = Router();

toolsRouter.get("/", renderToolsIndex);

toolDefinitions.forEach((tool) => {
  toolsRouter.get(`/${tool.slug}`, createToolPageController(tool.slug));
});
