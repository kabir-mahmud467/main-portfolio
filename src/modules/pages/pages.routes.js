import { Router } from "express";
import {
  renderAboutPage,
  renderDmcapage,
  renderHomePage,
  renderPrivacyPage,
  renderTermsAndConditionsPage,
  renderTermsPage
} from "./pages.controller.js";

export const pagesRouter = Router();

pagesRouter.get("/", renderHomePage);
pagesRouter.get("/about", renderAboutPage);
pagesRouter.get("/privacy-policy", renderPrivacyPage);
pagesRouter.get("/terms", renderTermsPage);
pagesRouter.get("/terms-and-conditions", renderTermsAndConditionsPage);
pagesRouter.get("/dmca", renderDmcapage);
