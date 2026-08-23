const AppError = require("../../shared/utils/AppError");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
} = require("../../shared/utils/tokens");
const { PERMISSION_LIST } = require("../../shared/constants/permissions");
const authRepository = require("./auth.repository");
const { DEFAULT_ADMIN } = require("./auth.constants");

const normalizePermissions = (permissions = []) => {
  if (!Array.isArray(permissions)) {
    throw new AppError("permissions must be an array of permission strings", 400);
  }

  const unique = [...new Set(permissions)];
  const invalid = unique.filter((p) => !PERMISSION_LIST.includes(p));
  if (invalid.length) {
    throw new AppError(`Invalid permissions: ${invalid.join(", ")}`, 400);
  }
  return unique;
};

const issueTokenPair = (user) => {
  const payload = {
    id: user._id.toString(),
    isSuperAdmin: user.isSuperAdmin,
    isAdmin: user.isAdmin,
  };

  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  return { accessToken, refreshToken };
};

const authService = {
  async seedDefaultAdmin() {
    const existing = await authRepository.existsByEmail(DEFAULT_ADMIN.email);
    if (!existing) {
      await authRepository.create(DEFAULT_ADMIN);
      console.log("Default admin seeded: admin@store.com / Admin@123");
    }
  },

  listAvailablePermissions() {
    return PERMISSION_LIST;
  },

  async login({ email, password }) {
    const user = await authRepository.findByEmail(email);
    if (!user || !(await user.comparePassword(password))) {
      throw new AppError("Invalid email or password", 401);
    }
    if (!user.isActive) {
      throw new AppError("Account is blocked", 403);
    }
    if (!user.isAdmin && !user.isSuperAdmin) {
      throw new AppError("Account does not have admin access", 403);
    }

    const { accessToken, refreshToken } = issueTokenPair(user);

    // Persist hashed refresh token so it can be rotated/revoked
    await authRepository.setRefreshTokenHash(user._id, hashToken(refreshToken));

    const safeUser = await authRepository.findById(user._id);

    return { accessToken, refreshToken, user: safeUser };
  },

  async refresh(rawRefreshToken) {
    if (!rawRefreshToken) {
      throw new AppError("Refresh token required", 401);
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(rawRefreshToken);
    } catch {
      throw new AppError("Invalid or expired refresh token", 401);
    }

    const user = await authRepository.findByIdWithRefresh(decoded.id);
    if (!user || !user.isActive) {
      throw new AppError("User not found or inactive", 401);
    }
    if (!user.isAdmin && !user.isSuperAdmin) {
      throw new AppError("Account does not have admin access", 403);
    }

    // Reject stolen/old refresh tokens
    if (!user.refreshTokenHash || user.refreshTokenHash !== hashToken(rawRefreshToken)) {
      throw new AppError("Refresh token has been revoked", 401);
    }

    const { accessToken, refreshToken } = issueTokenPair(user);
    await authRepository.setRefreshTokenHash(user._id, hashToken(refreshToken));

    const safeUser = await authRepository.findById(user._id);
    return { accessToken, refreshToken, user: safeUser };
  },

  async logout(userId) {
    if (userId) {
      await authRepository.clearRefreshTokenHash(userId);
    }
    return { message: "Logged out successfully" };
  },

  async getProfile(userId) {
    const user = await authRepository.findById(userId);
    if (!user) throw new AppError("User not found", 404);
    return user;
  },

  async changePassword(userId, { currentPassword, newPassword }) {
    const user = await authRepository.findByIdWithPassword(userId);
    if (!user) throw new AppError("User not found", 404);
    if (!(await user.comparePassword(currentPassword))) {
      throw new AppError("Current password is incorrect", 400);
    }
    if (!newPassword || newPassword.length < 6) {
      throw new AppError("New password must be at least 6 characters", 400);
    }

    // Triggers bcrypt pre-save hook (salt + hash)
    user.password = newPassword;
    await user.save();
    // Force re-login after password change
    await authRepository.clearRefreshTokenHash(userId);

    return { message: "Password updated successfully" };
  },

  async toggleTwoFactor(userId, enabled) {
    return authRepository.updateById(userId, { twoFactorEnabled: Boolean(enabled) });
  },

  async listAdmins() {
    return authRepository.findAll({});
  },

  async createAdmin({
    name,
    email,
    password,
    isSuperAdmin = false,
    isAdmin = true,
    permissions = [],
  }) {
    if (!name || !email || !password) {
      throw new AppError("name, email, and password are required", 400);
    }
    if (password.length < 6) {
      throw new AppError("Password must be at least 6 characters", 400);
    }

    const superFlag = Boolean(isSuperAdmin);
    // Super admin always counts as admin
    const adminFlag = superFlag ? true : Boolean(isAdmin);

    if (!superFlag && !adminFlag) {
      throw new AppError("Set isAdmin or isSuperAdmin to true", 400);
    }

    // Super admin always gets the full permission set
    let resolvedPermissions = normalizePermissions(permissions);
    if (superFlag) {
      resolvedPermissions = [...PERMISSION_LIST];
    }

    const exists = await authRepository.existsByEmail(email);
    if (exists) throw new AppError("Email already in use", 409);

    // Password is bcrypt-hashed + salted in the Admin pre-save hook
    const created = await authRepository.create({
      name,
      email,
      password,
      isSuperAdmin: superFlag,
      isAdmin: adminFlag,
      permissions: resolvedPermissions,
    });

    return authRepository.findById(created._id);
  },

  async updateAdmin(id, data, requesterId) {
    const { password, ...raw } = data;
    const updates = {};

    if (raw.name !== undefined) updates.name = raw.name;
    if (raw.email !== undefined) updates.email = raw.email;
    if (raw.isActive !== undefined) updates.isActive = Boolean(raw.isActive);
    if (raw.avatar !== undefined) updates.avatar = raw.avatar;

    if (raw.isSuperAdmin !== undefined) {
      updates.isSuperAdmin = Boolean(raw.isSuperAdmin);
      if (updates.isSuperAdmin) updates.isAdmin = true;
    }
    if (raw.isAdmin !== undefined) {
      updates.isAdmin = Boolean(raw.isAdmin);
    }

    if (raw.permissions !== undefined) {
      updates.permissions = normalizePermissions(raw.permissions);
    }

    // Super admin always has full access
    if (updates.isSuperAdmin) {
      updates.permissions = [...PERMISSION_LIST];
      updates.isAdmin = true;
    }

    if (id === requesterId.toString() && updates.isActive === false) {
      throw new AppError("You cannot deactivate your own account", 400);
    }
    if (id === requesterId.toString() && updates.isSuperAdmin === false) {
      throw new AppError("You cannot remove your own super admin access", 400);
    }

    const user = await authRepository.updateById(id, updates);
    if (!user) throw new AppError("Admin not found", 404);
    return user;
  },

  async deleteAdmin(id, requesterId) {
    if (id === requesterId.toString()) {
      throw new AppError("You cannot delete your own account", 400);
    }
    const user = await authRepository.deleteById(id);
    if (!user) throw new AppError("Admin not found", 404);
    return { message: "Admin account removed" };
  },

  listTeam() {
    return this.listAdmins();
  },
  createTeamMember(data) {
    return this.createAdmin(data);
  },
  updateTeamMember(id, data, requesterId) {
    return this.updateAdmin(id, data, requesterId);
  },
  deleteTeamMember(id, requesterId) {
    return this.deleteAdmin(id, requesterId);
  },
};

module.exports = authService;
