import { body, param } from "express-validator";

export const projectValidationRules = [
  body("title").trim().isLength({ min: 3, max: 180 }).withMessage("Project title must be between 3 and 180 characters."),
  body("summary").trim().isLength({ min: 20, max: 320 }).withMessage("Summary must be between 20 and 320 characters."),
  body("description").trim().isLength({ min: 20 }).withMessage("Description must be at least 20 characters."),
  body("status").isIn(["draft", "published"]).withMessage("Invalid project status."),
  body("github").optional({ checkFalsy: true }).isURL().withMessage("GitHub link must be a valid URL."),
  body("live").optional({ checkFalsy: true }).isURL().withMessage("Live demo link must be a valid URL."),
  body("coverImage").optional({ checkFalsy: true }).isURL().withMessage("Cover image must be a valid URL.")
];

export const projectIdParamRule = [param("id").isMongoId().withMessage("Invalid project id.")];
