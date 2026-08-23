const mongoose = require("mongoose");
const Admin = require("./auth.model");

const toObjectId = (id) => {
  if (id instanceof mongoose.Types.ObjectId) return id;
  return new mongoose.Types.ObjectId(id);
};

const ADMIN_PUBLIC_FIELDS =
  "name email isSuperAdmin isAdmin permissions avatar isActive twoFactorEnabled lastLoginAt createdAt updatedAt";

const authRepository = {
  findByEmail: (email) =>
    Admin.findOne({ email: String(email).toLowerCase().trim() })
      .select("+password")
      .lean(false),

  findById: (id) =>
    Admin.findById(toObjectId(id)).select(ADMIN_PUBLIC_FIELDS).lean(),

  findByIdWithRefresh: (id) =>
    Admin.findById(toObjectId(id)).select("+refreshTokenHash").lean(false),

  findByIdWithPassword: (id) =>
    Admin.findById(toObjectId(id)).select("+password").lean(false),

  findAll: (filter = {}) =>
    Admin.find(filter)
      .select(ADMIN_PUBLIC_FIELDS)
      .sort({ createdAt: -1 })
      .lean(),

  count: (filter = {}) => Admin.countDocuments(filter),

  create: (data) => Admin.create(data),

  /** Atomic $set update — avoids full document overwrite */
  updateById: (id, data) =>
    Admin.findByIdAndUpdate(
      toObjectId(id),
      { $set: data },
      { new: true, runValidators: true, select: ADMIN_PUBLIC_FIELDS }
    ).lean(),

  setRefreshTokenHash: (id, refreshTokenHash) =>
    Admin.updateOne(
      { _id: toObjectId(id) },
      { $set: { refreshTokenHash, lastLoginAt: new Date() } }
    ),

  clearRefreshTokenHash: (id) =>
    Admin.updateOne(
      { _id: toObjectId(id) },
      { $unset: { refreshTokenHash: "" } }
    ),

  deleteById: (id) => Admin.findByIdAndDelete(toObjectId(id)).lean(),

  existsByEmail: (email) =>
    Admin.exists({ email: String(email).toLowerCase().trim() }),
};

module.exports = authRepository;
