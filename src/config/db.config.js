import dotenv from "dotenv";
import { appConfig } from "./app.config.js";

dotenv.config();

const localMongoUri = "mongodb://127.0.0.1:27017/kabirmahmud_platform";

export const dbConfig = {
  uri: process.env.MONGODB_URI || (appConfig.isProduction ? "" : localMongoUri)
};
