import { Router } from "express";
import { renderContactPage } from "./contact.controller.js";

export const contactRouter = Router();

contactRouter.get("/", renderContactPage);
