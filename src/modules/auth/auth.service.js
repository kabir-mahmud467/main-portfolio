import { promisify } from "node:util";
import { appConfig } from "../../config/app.config.js";
import { securityConfig } from "../../config/security.config.js";
import { hashPassword, verifyPassword } from "../../core/utils/password.js";
import { createRawToken, hashToken } from "../../core/utils/tokens.js";
import {
  findUserByEmail,
  findUserByResetTokenHash
} from "./auth.repository.js";

const regenerateSession = (req) => promisify(req.session.regenerate).bind(req.session)();
const destroySession = (req) => promisify(req.session.destroy).bind(req.session)();

function isLocked(user) {
  return user.lockedUntil && user.lockedUntil > new Date();
}

function getRedirectTarget(nextUrl) {
  if (!nextUrl || !nextUrl.startsWith("/") || nextUrl.startsWith("//")) {
    return "/admin";
  }

  return nextUrl;
}

export async function loginAdmin(req, { email, password, remember, next }) {
  const user = await findUserByEmail(email);

  if (!user || !user.isActive || user.role !== "admin") {
    throw new Error("Invalid email or password.");
  }

  if (isLocked(user)) {
    throw new Error("This account is temporarily locked. Please try again later.");
  }

  const passwordMatches = await verifyPassword(password, user.passwordHash);

  if (!passwordMatches) {
    user.failedLoginAttempts += 1;
    if (user.failedLoginAttempts >= 5) {
      user.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
    }
    await user.save();
    throw new Error("Invalid email or password.");
  }

  user.failedLoginAttempts = 0;
  user.lockedUntil = null;
  user.lastLoginAt = new Date();
  await user.save();

  await regenerateSession(req);
  req.session.userId = user._id.toString();
  req.session.role = user.role;
  req.session.csrfToken = createRawToken(32);

  let rememberToken = null;
  if (remember) {
    rememberToken = createRawToken(32);
    user.rememberTokens.push({
      tokenHash: hashToken(rememberToken),
      expiresAt: new Date(Date.now() + securityConfig.rememberMeMaxAge)
    });
    await user.save();
  }

  return {
    redirectTo: getRedirectTarget(next),
    rememberToken
  };
}

export async function logoutAdmin(req, rememberToken) {
  if (rememberToken) {
    const user = await findUserByEmail(req.user?.email || "");
    if (user) {
      const tokenHash = hashToken(rememberToken);
      user.rememberTokens = user.rememberTokens.filter((item) => item.tokenHash !== tokenHash);
      await user.save();
    }
  }

  await destroySession(req);
}

export async function requestPasswordReset(email) {
  const user = await findUserByEmail(email);

  if (!user || !user.isActive || user.role !== "admin") {
    return null;
  }

  const rawToken = createRawToken(32);
  user.resetPasswordTokenHash = hashToken(rawToken);
  user.resetPasswordExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
  await user.save();

  return `${appConfig.url}/admin/reset-password/${rawToken}`;
}

export async function resetPassword({ token, password }) {
  const user = await findUserByResetTokenHash(hashToken(token));

  if (!user) {
    throw new Error("The reset link is invalid or has expired.");
  }

  user.passwordHash = await hashPassword(password);
  user.passwordChangedAt = new Date();
  user.resetPasswordTokenHash = null;
  user.resetPasswordExpiresAt = null;
  user.failedLoginAttempts = 0;
  user.lockedUntil = null;
  user.rememberTokens = [];
  await user.save();
}
