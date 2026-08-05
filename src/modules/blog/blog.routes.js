import { Router } from "express";
import { renderBlogIndex, renderBlogPost } from "./blog.controller.js";

export const blogRouter = Router();

blogRouter.get("/", renderBlogIndex);
blogRouter.get("/:slug", renderBlogPost);
