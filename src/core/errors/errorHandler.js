import { appConfig } from "../../config/app.config.js";
import { logger } from "../utils/logger.js";

export function notFoundHandler(req, res, next) {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

export function errorHandler(error, req, res, next) {
  const statusCode = error.statusCode || 500;
  const view = statusCode === 404 ? "errors/404" : "errors/500";

  logger.error("Request failed", {
    statusCode,
    method: req.method,
    path: req.originalUrl,
    error: error.message,
    stack: appConfig.isProduction ? undefined : error.stack
  });

  res.status(statusCode).render(view, {
    title: statusCode === 404 ? "Page not found" : "Server error",
    description: "Something went wrong.",
    statusCode,
    message: error.message,
    stack: appConfig.isProduction ? null : error.stack
  });
}
