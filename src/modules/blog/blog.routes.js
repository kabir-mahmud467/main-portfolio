import { Router } from "express";
import { renderBlogCategories, renderBlogCategory, renderBlogIndex, renderBlogPost } from "./blog.controller.js";

export const blogRouter = Router();

blogRouter.get("/categories", renderBlogCategories);
blogRouter.get("/category/:slug", renderBlogCategory);
blogRouter.get("/", renderBlogIndex);
blogRouter.get("/:slug", renderBlogPost);
