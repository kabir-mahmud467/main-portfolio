import { securityConfig } from "../../config/security.config.js";
import { findUserById, findUserByRememberTokenHash } from "../../modules/auth/auth.repository.js";
import { hashToken } from "../utils/tokens.js";

export async function attachAuthenticatedUser(req, res, next) {
  try {
    if (req.session?.userId) {
      req.user = await findUserById(req.session.userId);
      return next();
    }

    const rememberToken = req.signedCookies?.[securityConfig.rememberCookieName];

    if (!rememberToken) {
      return next();
    }

    const user = await findUserByRememberTokenHash(hashToken(rememberToken));

    if (!user) {
      res.clearCookie(securityConfig.rememberCookieName);
      return next();
    }

    req.session.userId = user._id.toString();
    req.session.role = user.role;
    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
}

export function requireAuth(req, res, next) {
  if (req.user) {
    return next();
  }

  req.flash("error", "Please sign in to continue.");
  return res.redirect(`/admin/login?next=${encodeURIComponent(req.originalUrl)}`);
}

export function requireGuest(req, res, next) {
  if (!req.user) {
    return next();
  }

  return res.redirect("/admin");
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (req.user && allowedRoles.includes(req.user.role)) {
      return next();
    }

    const error = new Error("You do not have permission to access this resource.");
    error.statusCode = 403;
    return next(error);
  };
}
