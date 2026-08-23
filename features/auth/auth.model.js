const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { PERMISSION_LIST } = require("../../shared/constants/permissions");

const BCRYPT_SALT_ROUNDS = 12;

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // Hashed with bcrypt + salt (see pre-save hook)
    password: { type: String, required: true, minlength: 6, select: false },
    isSuperAdmin: { type: Boolean, default: false, index: true },
    isAdmin: { type: Boolean, default: true, index: true },
    permissions: {
      type: [{ type: String, enum: PERMISSION_LIST }],
      default: [],
    },
    avatar: { type: String, default: null },
    isActive: { type: Boolean, default: true, index: true },
    twoFactorEnabled: { type: Boolean, default: false },
    lastLoginAt: { type: Date, default: null },
    // SHA-256 hash of current refresh JWT — used to revoke/rotate sessions
    refreshTokenHash: { type: String, default: null, select: false },
  },
  { timestamps: true }
);

// Compound index for common auth lookups
adminSchema.index({ email: 1, isActive: 1 });
adminSchema.index({ isSuperAdmin: 1, isAdmin: 1, isActive: 1 });

adminSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  // bcrypt generates a unique salt per hash at the given cost factor
  this.password = await bcrypt.hash(this.password, BCRYPT_SALT_ROUNDS);
  next();
});

adminSchema.methods.hasPermission = function hasPermission(permission) {
  if (this.isSuperAdmin) return true;
  if (!this.isAdmin || !this.isActive) return false;
  return this.permissions.includes(permission);
};

adminSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model("Admin", adminSchema);
