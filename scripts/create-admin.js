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
  console.error("An account with that email already exists.");
  await mongoose.disconnect();
  process.exit(1);
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
