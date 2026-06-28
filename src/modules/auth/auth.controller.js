import { validationResult } from "express-validator";
import { appConfig } from "../../config/app.config.js";
import { securityConfig } from "../../config/security.config.js";
import { buildMeta } from "../../core/utils/metaBuilder.js";
import {
  loginAdmin,
  logoutAdmin,
  requestPasswordReset,
  resetPassword
} from "./auth.service.js";

function renderWithValidationErrors(req, res, view, data) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render(view, {
      ...data,
      errors: errors.array().map((error) => error.msg)
    });
  }

  return null;
}

export function renderLoginPage(req, res) {
  res.render("pages/auth/login", {
    title: "Admin Login",
    meta: buildMeta(req, {
      title: "Admin Login",
      description: "Secure admin login for kabirmahmud.xyz.",
      noIndex: true
    }),
    next: req.query.next || "/admin",
    errors: []
  });
}

export async function handleLogin(req, res) {
  const invalid = renderWithValidationErrors(req, res, "pages/auth/login", {
    title: "Admin Login",
    meta: buildMeta(req, {
      title: "Admin Login",
      description: "Secure admin login for kabirmahmud.xyz.",
      noIndex: true
    }),
    next: req.body.next || "/admin"
  });

  if (invalid) {
    return invalid;
  }

  try {
    const result = await loginAdmin(req, {
      email: req.body.email,
      password: req.body.password,
      remember: req.body.remember === "on",
      next: req.body.next
    });

    if (result.rememberToken) {
      res.cookie(securityConfig.rememberCookieName, result.rememberToken, {
        httpOnly: true,
        signed: true,
        secure: appConfig.isProduction,
        sameSite: "lax",
        maxAge: securityConfig.rememberMeMaxAge
      });
    }

    req.flash("success", "Welcome back.");
    return res.redirect(result.redirectTo);
  } catch (error) {
    return res.status(401).render("pages/auth/login", {
      title: "Admin Login",
      meta: buildMeta(req, {
        title: "Admin Login",
        description: "Secure admin login for kabirmahmud.xyz.",
        noIndex: true
      }),
      next: req.body.next || "/admin",
      errors: [error.message]
    });
  }
}

export async function handleLogout(req, res, next) {
  try {
    const rememberToken = req.signedCookies?.[securityConfig.rememberCookieName];
    await logoutAdmin(req, rememberToken);
    res.clearCookie(securityConfig.rememberCookieName);
    res.redirect("/admin/login");
  } catch (error) {
    next(error);
  }
}

export function renderForgotPasswordPage(req, res) {
  res.render("pages/auth/forgot-password", {
    title: "Forgot Password",
    meta: buildMeta(req, {
      title: "Forgot Password",
      description: "Request a secure admin password reset.",
      noIndex: true
    }),
    errors: []
  });
}

export async function handleForgotPassword(req, res, next) {
  const invalid = renderWithValidationErrors(req, res, "pages/auth/forgot-password", {
    title: "Forgot Password",
    meta: buildMeta(req, {
      title: "Forgot Password",
      description: "Request a secure admin password reset.",
      noIndex: true
    })
  });

  if (invalid) {
    return invalid;
  }

  try {
    const resetLink = await requestPasswordReset(req.body.email);

    if (resetLink && !appConfig.isProduction) {
      console.info(`Password reset link: ${resetLink}`);
    }

    req.flash("success", "If an admin account exists for that email, a reset link has been generated.");
    return res.redirect("/admin/forgot-password");
  } catch (error) {
    return next(error);
  }
}

export function renderResetPasswordPage(req, res) {
  res.render("pages/auth/reset-password", {
    title: "Reset Password",
    meta: buildMeta(req, {
      title: "Reset Password",
      description: "Set a new secure admin password.",
      noIndex: true
    }),
    token: req.params.token,
    errors: []
  });
}

export async function handleResetPassword(req, res, next) {
  const invalid = renderWithValidationErrors(req, res, "pages/auth/reset-password", {
    title: "Reset Password",
    meta: buildMeta(req, {
      title: "Reset Password",
      description: "Set a new secure admin password.",
      noIndex: true
    }),
    token: req.params.token
  });

  if (invalid) {
    return invalid;
  }

  try {
    await resetPassword({
      token: req.params.token,
      password: req.body.password
    });

    req.flash("success", "Password updated. Please sign in with your new password.");
    return res.redirect("/admin/login");
  } catch (error) {
    return res.status(400).render("pages/auth/reset-password", {
      title: "Reset Password",
      meta: buildMeta(req, {
        title: "Reset Password",
        description: "Set a new secure admin password.",
        noIndex: true
      }),
      token: req.params.token,
      errors: [error.message]
    });
  }
}
