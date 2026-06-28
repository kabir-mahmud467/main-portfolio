import { User } from "./user.model.js";

export function findUserByEmail(email) {
  return User.findOne({ email: email.toLowerCase().trim() });
}

export function findUserById(id) {
  return User.findOne({ _id: id, isActive: true }).select("-passwordHash -resetPasswordTokenHash").lean();
}

export function findUserByResetTokenHash(tokenHash) {
  return User.findOne({
    resetPasswordTokenHash: tokenHash,
    resetPasswordExpiresAt: { $gt: new Date() },
    isActive: true
  });
}

export function findUserByRememberTokenHash(tokenHash) {
  return User.findOne({
    "rememberTokens.tokenHash": tokenHash,
    "rememberTokens.expiresAt": { $gt: new Date() },
    isActive: true
  })
    .select("-passwordHash -resetPasswordTokenHash")
    .lean();
}

export function createUser(payload) {
  return User.create(payload);
}
