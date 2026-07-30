import { Router } from "express";
import { renderAdminSettings, handleUpdateSettings } from "./settings.controller.js";

export const settingsRouter = Router();

settingsRouter.get("/", renderAdminSettings);
settingsRouter.post("/:group", handleUpdateSettings);
