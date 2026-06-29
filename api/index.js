import app from "../src/app.js";
import { connectDatabase } from "../src/config/db.js";
import { logger } from "../src/core/utils/logger.js";

export default async function handler(req, res) {
  try {
    await connectDatabase();
    return app(req, res);
  } catch (error) {
    logger.error("Serverless request bootstrap failed", {
      error: error.message,
      stack: error.stack
    });
    res.statusCode = 500;
    res.end("Internal Server Error");
  }
}
