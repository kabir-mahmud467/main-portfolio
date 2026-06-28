import { appConfig } from "../../config/app.config.js";

function write(level, message, context = {}) {
  const payload = {
    level,
    message,
    timestamp: new Date().toISOString(),
    env: appConfig.env,
    ...context
  };

  if (appConfig.isProduction) {
    console[level === "error" ? "error" : "log"](JSON.stringify(payload));
    return;
  }

  console[level === "error" ? "error" : "log"](`[${level}] ${message}`, context);
}

export const logger = {
  info(message, context) {
    write("info", message, context);
  },
  warn(message, context) {
    write("warn", message, context);
  },
  error(message, context) {
    write("error", message, context);
  }
};
