import mongoose from "mongoose";
import { dbConfig } from "./db.config.js";
import { logger } from "../core/utils/logger.js";

let connectionPromise = null;

export async function connectDatabase() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  mongoose.set("strictQuery", true);

  connectionPromise = mongoose.connect(dbConfig.uri, {
    autoIndex: process.env.NODE_ENV !== "production"
  });

  await connectionPromise;
  logger.info("MongoDB connected");
  return mongoose.connection;
}
