import { Router } from "express";
import { renderAboutPage, renderHomePage, renderPrivacyPage, renderTermsPage } from "./pages.controller.js";

export const pagesRouter = Router();

pagesRouter.get("/", renderHomePage);
pagesRouter.get("/about", renderAboutPage);
pagesRouter.get("/privacy-policy", renderPrivacyPage);
pagesRouter.get("/terms", renderTermsPage);
