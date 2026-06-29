import crypto from "node:crypto";
import compression from "compression";
import cookieParser from "cookie-parser";
import flash from "connect-flash";
import MongoStore from "connect-mongo";
import rateLimit from "express-rate-limit";
import session from "express-session";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from "mongoose";
import { appConfig } from "../../config/app.config.js";
import { connectDatabase } from "../../config/db.js";
import { securityConfig } from "../../config/security.config.js";

const sessionStoreClientPromise = connectDatabase().then(() => mongoose.connection.getClient());

export function registerCoreMiddleware(app, express) {
  app.set("trust proxy", appConfig.trustProxy);

  app.use((req, res, next) => {
    res.locals.cspNonce = crypto.randomBytes(16).toString("base64");
    next();
  });

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          ...helmet.contentSecurityPolicy.getDefaultDirectives(),
          "script-src": ["'self'", (req, res) => `'nonce-${res.locals.cspNonce}'`],
          "style-src": ["'self'", "https://fonts.googleapis.com"],
          "font-src": ["'self'", "https://fonts.gstatic.com"],
          "img-src": ["'self'", "data:", "blob:", "https://api.qrserver.com"]
        }
      }
    })
  );

  app.use(compression());
  app.use(morgan(appConfig.isProduction ? "combined" : "dev"));
  app.use(rateLimit(securityConfig.rateLimit));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser(appConfig.cookieSecret));
  app.use(
    session({
      name: "km.sid",
      secret: appConfig.sessionSecret,
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        clientPromise: sessionStoreClientPromise,
        collectionName: "sessions",
        ttl: 60 * 60 * 24 * 7
      }),
      cookie: {
        httpOnly: true,
        secure: appConfig.isProduction,
        sameSite: "lax",
        maxAge: securityConfig.sessionCookieMaxAge
      }
    })
  );
  app.use(flash());
}
