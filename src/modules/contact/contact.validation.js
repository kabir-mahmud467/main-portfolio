import { body } from "express-validator";

export const contactValidationRules = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage("Name must be between 2 and 120 characters."),
  body("email").trim().isEmail().normalizeEmail().withMessage("Please enter a valid email address."),
  body("subject")
    .trim()
    .isLength({ min: 3, max: 180 })
    .withMessage("Subject must be between 3 and 180 characters."),
  body("message")
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage("Message must be between 10 and 5000 characters.")
];
