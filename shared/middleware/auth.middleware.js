const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const {
  verifyAccessToken,
  ACCESS_COOKIE,
  REFRESH_COOKIE,
} = require("../utils/tokens");
const authRepository = require("../../features/auth/auth.repository");

const extractAccessToken = (req) => {
  // Prefer httpOnly cookie (auto-sent by browser with credentials: 'include')
  if (req.cookies?.[ACCESS_COOKIE]) {
    return req.cookies[ACCESS_COOKIE];
  }
  // Fallback for Swagger / API clients
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }
  return null;
};

const protect = asyncHandler(async (req, res, next) => {
  const token = extractAccessToken(req);
  if (!token) {
    throw new AppError("Authentication required", 401);
  }

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch {
    throw new AppError("Invalid or expired access token", 401);
  }

  const user = await authRepository.findById(decoded.id);
  if (!user || !user.isActive) {
    throw new AppError("User not found or inactive", 401);
  }
  if (!user.isAdmin && !user.isSuperAdmin) {
    throw new AppError("Account does not have admin access", 403);
  }

  req.user = user;
  next();
});

const requireSuperAdmin = asyncHandler(async (req, res, next) => {
  if (!req.user?.isSuperAdmin) {
    throw new AppError("Only a super admin can perform this action", 403);
  }
  next();
});

const requirePermission = (...permissions) =>
  asyncHandler(async (req, res, next) => {
    if (req.user.isSuperAdmin) return next();

    const allowed = permissions.some((p) => req.user.permissions?.includes(p));
    if (!allowed) {
      throw new AppError("Insufficient permissions", 403);
    }
    next();
  });

const allowBootstrapOrSuperAdmin = asyncHandler(async (req, res, next) => {
  const adminCount = await authRepository.count({});

  if (adminCount === 0) {
    return next();
  }

  const token = extractAccessToken(req);
  if (!token) {
    throw new AppError("Authentication required to create admin accounts", 401);
  }

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch {
    throw new AppError("Invalid or expired access token", 401);
  }

  const user = await authRepository.findById(decoded.id);
  if (!user || !user.isActive) {
    throw new AppError("User not found or inactive", 401);
  }
  if (!user.isSuperAdmin) {
    throw new AppError("Only a super admin can create other admin accounts", 403);
  }

  req.user = user;
  next();
});

module.exports = {
  protect,
  requireSuperAdmin,
  requirePermission,
  allowBootstrapOrSuperAdmin,
  extractAccessToken,
  ACCESS_COOKIE,
  REFRESH_COOKIE,
};
