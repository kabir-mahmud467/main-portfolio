import { Router } from "express";
import { validateRequest } from "../../core/middleware/validate.middleware.js";
import { handleContactSubmit, renderContactPage } from "./contact.controller.js";
import { contactValidationRules } from "./contact.validation.js";

export const contactRouter = Router();

contactRouter.get("/", renderContactPage);
contactRouter.post("/", contactValidationRules, validateRequest, handleContactSubmit);
