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

const isProduction = process.env.NODE_ENV === "production";

const sessionSecret = process.env.SESSION_SECRET || "development-session-secret";
const cookieSecret = process.env.COOKIE_SECRET || "development-cookie-secret";

if (isProduction) {
  const weakSecrets = ["development-session-secret", "development-cookie-secret", "replace-with-a-long-random-secret", "replace-with-a-long-random-cookie-secret"];

  if (!process.env.SESSION_SECRET || weakSecrets.includes(process.env.SESSION_SECRET)) {
    throw new Error("SESSION_SECRET must be set to a strong random value in production.");
  }

  if (!process.env.COOKIE_SECRET || weakSecrets.includes(process.env.COOKIE_SECRET)) {
    throw new Error("COOKIE_SECRET must be set to a strong random value in production.");
  }
}

export const appConfig = {
  env: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 3000),
  name: process.env.APP_NAME || "Kabir Mahmud",
  url: configuredUrl || (process.env.NODE_ENV === "production" ? "https://kabirmahmud.xyz" : "http://localhost:3000"),
  trustProxy: resolveTrustProxy(),
  sessionSecret,
  cookieSecret,
  isProduction,
  isVercel: process.env.VERCEL === "1"
};
