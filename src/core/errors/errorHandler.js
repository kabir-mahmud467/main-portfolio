import { appConfig } from "../../config/app.config.js";
import { logger } from "../utils/logger.js";

class AppError extends Error {
  constructor(message, statusCode = 500, details = {}) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

export { AppError };

export function notFoundHandler(req, res, next) {
  const error = new AppError(`Route not found: ${req.originalUrl}`, 404);
  next(error);
}

export function errorHandler(error, req, res, next) {
  const statusCode = error.statusCode || 500;
  const isApiRequest = req.path.startsWith("/api");

  logger.error("Request failed", {
    statusCode,
    method: req.method,
    path: req.originalUrl,
    error: error.message,
    stack: appConfig.isProduction ? undefined : error.stack
  });

  if (isApiRequest) {
    res.status(statusCode).json({
      success: false,
      error: {
        message: statusCode === 404 || !appConfig.isProduction ? error.message : "Internal Server Error",
        statusCode,
        ...(error.details && Object.keys(error.details).length ? { details: error.details } : {})
      }
    });
    return;
  }

  const view = statusCode === 404 ? "errors/404" : "errors/500";

  res.status(statusCode).render(view, {
    title: statusCode === 404 ? "Page not found" : "Server error",
    description: "Something went wrong.",
    statusCode,
    message: statusCode === 404 || !appConfig.isProduction ? error.message : "Something went wrong.",
    stack: appConfig.isProduction ? null : error.stack
  });
}
