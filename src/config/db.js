import mongoose from "mongoose";
import { dbConfig } from "./db.config.js";
import { logger } from "../core/utils/logger.js";

let connectionPromise = null;

export async function connectDatabase() {
  if (!dbConfig.uri) {
    throw new Error("MONGODB_URI is required in production.");
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  mongoose.set("strictQuery", true);
  mongoose.set("bufferCommands", false);

  connectionPromise = mongoose.connect(dbConfig.uri, {
    autoIndex: process.env.NODE_ENV !== "production",
    serverSelectionTimeoutMS: 5000,
    maxPoolSize: 10
  });

  try {
    await connectionPromise;
    logger.info("MongoDB connected");
    return mongoose.connection;
  } catch (error) {
    connectionPromise = null;
    throw error;
  }
}
