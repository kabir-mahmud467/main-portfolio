import { validationResult } from "express-validator";

export function validateRequest(req, res, next) {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  req.flash("error", errors.array().map((error) => error.msg));
  return res.redirect(req.get("Referrer") || "/");
}
