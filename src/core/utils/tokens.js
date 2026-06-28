import crypto from "node:crypto";

export function createRawToken(byteLength = 32) {
  return crypto.randomBytes(byteLength).toString("hex");
}

export function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}
