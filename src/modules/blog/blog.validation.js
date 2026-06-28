import { body, param } from "express-validator";

export const postValidationRules = [
  body("title").trim().isLength({ min: 3, max: 180 }).withMessage("Title must be between 3 and 180 characters."),
  body("excerpt").trim().isLength({ min: 20, max: 320 }).withMessage("Excerpt must be between 20 and 320 characters."),
  body("content").trim().isLength({ min: 20 }).withMessage("Content must be at least 20 characters."),
  body("status").isIn(["draft", "published"]).withMessage("Invalid post status."),
  body("coverImage").optional({ checkFalsy: true }).isURL().withMessage("Featured image must be a valid URL."),
  body("ogImage").optional({ checkFalsy: true }).isURL().withMessage("Open Graph image must be a valid URL."),
  body("canonicalUrl").optional({ checkFalsy: true }).isURL().withMessage("Canonical URL must be a valid URL.")
];

export const categoryValidationRules = [
  body("name").trim().isLength({ min: 2, max: 100 }).withMessage("Category name must be between 2 and 100 characters.")
];

export const idParamRule = [
  param("id").isMongoId().withMessage("Invalid resource id.")
];
