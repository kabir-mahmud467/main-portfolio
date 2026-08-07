import { connectDatabase } from "../../config/db.js";

const CONNECT_TIMEOUT_MS = 15000;

export async function ensureDatabaseConnection(req, res, next) {
  try {
    await Promise.race([
      connectDatabase(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Database connection timed out.")), CONNECT_TIMEOUT_MS)
      )
    ]);
    next();
  } catch (error) {
    next(error);
  }
}
