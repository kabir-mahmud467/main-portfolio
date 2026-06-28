import { Router } from "express";
import { renderAboutPage, renderHomePage } from "./pages.controller.js";

export const pagesRouter = Router();

pagesRouter.get("/", renderHomePage);
pagesRouter.get("/about", renderAboutPage);
