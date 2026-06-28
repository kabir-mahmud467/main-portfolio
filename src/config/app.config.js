import dotenv from "dotenv";

dotenv.config();

export const appConfig = {
  env: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 3000),
  name: process.env.APP_NAME || "Kabir Mahmud",
  url: process.env.APP_URL || "http://localhost:3000",
  trustProxy: Number(process.env.TRUST_PROXY || 0),
  sessionSecret: process.env.SESSION_SECRET || "development-session-secret",
  cookieSecret: process.env.COOKIE_SECRET || "development-cookie-secret",
  isProduction: process.env.NODE_ENV === "production"
};
