import mongoose from "mongoose";

const rememberTokenSchema = new mongoose.Schema(
  {
    tokenHash: { type: String, required: true, index: true },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 180,
      index: true
    },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "editor"],
      default: "editor",
      index: true
    },
    isActive: { type: Boolean, default: true, index: true },
    failedLoginAttempts: { type: Number, default: 0 },
    lockedUntil: { type: Date, default: null },
    lastLoginAt: { type: Date, default: null },
    passwordChangedAt: { type: Date, default: null },
    resetPasswordTokenHash: { type: String, default: null, index: true },
    resetPasswordExpiresAt: { type: Date, default: null },
    rememberTokens: [rememberTokenSchema]
  },
  { timestamps: true }
);

userSchema.index({ "rememberTokens.tokenHash": 1 });
userSchema.index({ resetPasswordTokenHash: 1, resetPasswordExpiresAt: 1 });

export const User = mongoose.model("User", userSchema);
