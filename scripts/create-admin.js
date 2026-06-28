import dotenv from "dotenv";
import mongoose from "mongoose";
import { dbConfig } from "../src/config/db.config.js";
import { createUser, findUserByEmail } from "../src/modules/auth/auth.repository.js";
import { hashPassword } from "../src/core/utils/password.js";

dotenv.config();

const [name, email, password] = process.argv.slice(2);

if (!name || !email || !password) {
  console.error("Usage: node scripts/create-admin.js \"Kabir Mahmud\" admin@example.com \"StrongPassword123\"");
  process.exit(1);
}

await mongoose.connect(dbConfig.uri);

const existing = await findUserByEmail(email);
if (existing) {
  existing.name = name;
  existing.passwordHash = await hashPassword(password);
  existing.role = "admin";
  existing.isActive = true;
  existing.failedLoginAttempts = 0;
  existing.lockedUntil = null;
  existing.rememberTokens = [];
  await existing.save();
  console.log("Admin user updated.");
  await mongoose.disconnect();
  process.exit(0);
}

await createUser({
  name,
  email,
  passwordHash: await hashPassword(password),
  role: "admin",
  isActive: true
});

console.log("Admin user created.");
await mongoose.disconnect();
