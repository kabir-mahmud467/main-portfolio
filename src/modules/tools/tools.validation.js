import { body, param } from "express-validator";

export const toolValidationRules = [
  body("name").trim().isLength({ min: 3, max: 140 }).withMessage("Tool name must be between 3 and 140 characters."),
  body("description").trim().isLength({ min: 10, max: 320 }).withMessage("Description must be between 10 and 320 characters."),
  body("category").trim().isLength({ min: 2, max: 60 }).withMessage("Category must be between 2 and 60 characters."),
  body("status").isIn(["active", "inactive"]).withMessage("Invalid tool status."),
  body("usageCount").optional().isInt({ min: 0 }).withMessage("Usage count must be a non-negative integer."),
  body("ogImage").optional({ checkFalsy: true }).isURL().withMessage("Open Graph image must be a valid URL."),
  body("coverImage").optional({ checkFalsy: true }).isURL().withMessage("Cover image must be a valid URL.")
];

export const toolIdParamRule = [param("id").isMongoId().withMessage("Invalid tool id.")];
