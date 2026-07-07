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

const configuredUrl = (process.env.APP_URL || process.env.PUBLIC_URL || "").trim();

export const appConfig = {
  env: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 3000),
  name: process.env.APP_NAME || "Kabir Mahmud",
  url: configuredUrl || (process.env.NODE_ENV === "production" ? "https://kabirmahmud.xyz" : "http://localhost:3000"),
  trustProxy: resolveTrustProxy(),
  sessionSecret: process.env.SESSION_SECRET || "development-session-secret",
  cookieSecret: process.env.COOKIE_SECRET || "development-cookie-secret",
  isProduction: process.env.NODE_ENV === "production",
  isVercel: process.env.VERCEL === "1"
};
