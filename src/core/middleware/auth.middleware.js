import { securityConfig } from "../../config/security.config.js";
import { findUserById, findUserByRememberTokenHash } from "../../modules/auth/auth.repository.js";
import { debugLog } from "../utils/debugLog.js";
import { saveSession } from "../utils/session.js";
import { hashToken } from "../utils/tokens.js";

export async function attachAuthenticatedUser(req, res, next) {
  try {
    // #region agent log
    debugLog("auth.middleware.js:attachAuthenticatedUser", "auth attach entry", {
      method: req.method,
      path: req.originalUrl,
      hasReqSecret: Boolean(req.secret),
      hasSessionUserId: Boolean(req.session?.userId),
      hasRememberCookieRaw: Boolean(req.cookies?.[securityConfig.rememberCookieName])
    }, "H4");
    // #endregion

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
    await saveSession(req);
    return next();
  } catch (error) {
    // #region agent log
    debugLog("auth.middleware.js:attachAuthenticatedUser", "auth attach error", {
      method: req.method,
      path: req.originalUrl,
      errorMessage: error.message
    }, "H4");
    // #endregion
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
