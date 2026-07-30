import { Router } from "express";
import { renderToolsIndex } from "./tools.controller.js";

export const toolsRouter = Router();

toolsRouter.get("/", renderToolsIndex);
toolsRouter.get("/:slug", (req, res) => {
  res.redirect(301, `https://tools.kabirmahmud.xyz/${req.params.slug}`);
});
