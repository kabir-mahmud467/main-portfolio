import { Router } from "express";
import rateLimit from "express-rate-limit";
import { requireAuth, requireGuest } from "../../core/middleware/auth.middleware.js";
import { securityConfig } from "../../config/security.config.js";
import {
  handleForgotPassword,
  handleLogin,
  handleLogout,
  handleResetPassword,
  renderForgotPasswordPage,
  renderLoginPage,
  renderResetPasswordPage
} from "./auth.controller.js";
import {
  forgotPasswordValidationRules,
  loginValidationRules,
  resetPasswordValidationRules
} from "./auth.validation.js";

export const authRouter = Router();
const authLimiter = rateLimit(securityConfig.authRateLimit);

authRouter.get("/login", requireGuest, renderLoginPage);
authRouter.post("/login", authLimiter, requireGuest, loginValidationRules, handleLogin);

authRouter.post("/logout", requireAuth, handleLogout);

authRouter.get("/forgot-password", requireGuest, renderForgotPasswordPage);
authRouter.post(
  "/forgot-password",
  authLimiter,
  requireGuest,
  forgotPasswordValidationRules,
  handleForgotPassword
);

authRouter.get("/reset-password/:token", requireGuest, renderResetPasswordPage);
authRouter.post(
  "/reset-password/:token",
  authLimiter,
  requireGuest,
  resetPasswordValidationRules,
  handleResetPassword
);
