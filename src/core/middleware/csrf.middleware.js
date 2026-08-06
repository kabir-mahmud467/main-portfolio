import crypto from "node:crypto";
import { createRawToken } from "../utils/tokens.js";
import { securityConfig } from "../../config/security.config.js";

const safeMethods = new Set(["GET", "HEAD", "OPTIONS"]);

export function csrfProtection(req, res, next) {
  if (!req.session) {
    return next();
  }

  if (!req.session.csrfToken) {
    req.session.csrfToken = createRawToken(32);
  }

  req.csrfToken = () => req.session.csrfToken;

  if (safeMethods.has(req.method)) {
    return next();
  }

  const submittedToken =
    req.body?.[securityConfig.csrfFieldName] ||
    req.headers["x-csrf-token"] ||
    req.headers["csrf-token"];

  const submitted = String(submittedToken || "");
  const expected = String(req.session.csrfToken || "");
  const submittedBuffer = Buffer.from(submitted);
  const expectedBuffer = Buffer.from(expected);

  if (
    submittedBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(submittedBuffer, expectedBuffer)
  ) {
    const error = new Error("Invalid CSRF token.");
    error.statusCode = 403;
    return next(error);
  }

  return next();
}
