import app from "../src/app.js";
import { connectDatabase } from "../src/config/db.js";
import { debugLog } from "../src/core/utils/debugLog.js";
import { logger } from "../src/core/utils/logger.js";

export default async function handler(req, res) {
  try {
    await connectDatabase();
    // #region agent log
    debugLog("api/index.js:handler", "serverless bootstrap ok", {
      method: req.method,
      url: req.url
    }, "H3");
    // #endregion
    return app(req, res);
  } catch (error) {
    // #region agent log
    debugLog("api/index.js:handler", "serverless bootstrap failed", {
      errorMessage: error.message
    }, "H3");
    // #endregion
    logger.error("Serverless request bootstrap failed", {
      error: error.message,
      stack: error.stack
    });
    res.statusCode = 500;
    res.end("Internal Server Error");
  }
}
