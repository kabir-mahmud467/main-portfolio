import { validationResult } from "express-validator";

export function validateRequest(req, res, next) {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  req.flash("error", errors.array().map((error) => error.msg));

  let fallback = "/";
  const referrer = req.get("Referrer");

  if (referrer) {
    try {
      const ref = new URL(referrer);
      if (ref.host === req.get("host")) {
        fallback = `${ref.pathname}${ref.search}`;
      }
    } catch {
      // ignore malformed referrer
    }
  }

  return res.redirect(fallback);
}
