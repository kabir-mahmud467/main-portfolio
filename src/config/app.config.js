import dotenv from "dotenv";

dotenv.config();

function resolveTrustProxy() {
  if (process.env.VERCEL === "1") {
    return 1;
  }

  const raw = process.env.TRUST_PROXY;

  if (raw === "1" || raw === "true") {
    return 1;
  }

  return Number(raw || 0) || 0;
}

export const appConfig = {
  env: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 3000),
  name: process.env.APP_NAME || "Kabir Mahmud",
  url: process.env.APP_URL || "http://localhost:3000",
  trustProxy: resolveTrustProxy(),
  sessionSecret: process.env.SESSION_SECRET || "development-session-secret",
  cookieSecret: process.env.COOKIE_SECRET || "development-cookie-secret",
  isProduction: process.env.NODE_ENV === "production",
  isVercel: process.env.VERCEL === "1"
};
