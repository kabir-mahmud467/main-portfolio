export const securityConfig = {
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false
  },
  authRateLimit: {
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: "Too many authentication attempts. Please try again later."
  },
  sessionCookieMaxAge: 1000 * 60 * 60 * 24 * 7,
  rememberMeMaxAge: 1000 * 60 * 60 * 24 * 30,
  rememberCookieName: "km.remember",
  csrfFieldName: "_csrf"
};
