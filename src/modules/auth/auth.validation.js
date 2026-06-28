import { body, param } from "express-validator";

export const loginValidationRules = [
  body("email").trim().isEmail().normalizeEmail().withMessage("Please enter a valid email address."),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters.")
];

export const forgotPasswordValidationRules = [
  body("email").trim().isEmail().normalizeEmail().withMessage("Please enter a valid email address.")
];

export const resetPasswordValidationRules = [
  param("token").isHexadecimal().isLength({ min: 64, max: 64 }).withMessage("Invalid reset token."),
  body("password")
    .isLength({ min: 12 })
    .withMessage("Password must be at least 12 characters.")
    .matches(/[a-z]/)
    .withMessage("Password must include a lowercase letter.")
    .matches(/[A-Z]/)
    .withMessage("Password must include an uppercase letter.")
    .matches(/[0-9]/)
    .withMessage("Password must include a number."),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Password confirmation does not match.");
    }
    return true;
  })
];
