import { connectDatabase } from "../../config/db.js";

export async function ensureDatabaseConnection(req, res, next) {
  try {
    await connectDatabase();
    next();
  } catch (error) {
    next(error);
  }
}
