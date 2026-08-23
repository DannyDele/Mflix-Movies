const authService = require("./auth.service");
const { sendSuccess } = require("../../shared/utils/apiResponse");
const asyncHandler = require("../../shared/utils/asyncHandler");
const { setAuthCookies, clearAuthCookies } = require("../../shared/utils/cookies");
const {
  REFRESH_COOKIE,
  ACCESS_COOKIE,
  verifyAccessToken,
  verifyRefreshToken,
} = require("../../shared/utils/tokens");

const resolveUserIdFromCookies = (req) => {
  try {
    const access = req.cookies?.[ACCESS_COOKIE];
    if (access) return verifyAccessToken(access).id;
  } catch {
    // access may be expired — fall through to refresh
  }
  try {
    const refresh = req.cookies?.[REFRESH_COOKIE];
    if (refresh) return verifyRefreshToken(refresh).id;
  } catch {
    return null;
  }
  return null;
};

const authController = {
  login: asyncHandler(async (req, res) => {
    const result = await authService.login(req.body);

    // Cookies for the browser app; tokens in body for Swagger / API clients
    setAuthCookies(res, {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });

    sendSuccess(res, {
      data: {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
      message: "Login successful",
    });
  }),

  refresh: asyncHandler(async (req, res) => {
    const rawRefresh =
      req.cookies?.[REFRESH_COOKIE] || req.body?.refreshToken || null;

    const result = await authService.refresh(rawRefresh);

    setAuthCookies(res, {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });

    sendSuccess(res, {
      data: {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
      message: "Token refreshed",
    });
  }),

  logout: asyncHandler(async (req, res) => {
    const userId = resolveUserIdFromCookies(req);
    const result = await authService.logout(userId);
    clearAuthCookies(res);
    sendSuccess(res, { data: result, message: result.message });
  }),

  getMe: asyncHandler(async (req, res) => {
    const user = await authService.getProfile(req.user._id);
    sendSuccess(res, { data: user });
  }),

  changePassword: asyncHandler(async (req, res) => {
    const result = await authService.changePassword(req.user._id, req.body);
    clearAuthCookies(res);
    sendSuccess(res, { data: result, message: result.message });
  }),

  toggleTwoFactor: asyncHandler(async (req, res) => {
    const user = await authService.toggleTwoFactor(req.user._id, req.body.enabled);
    sendSuccess(res, { data: user, message: "Two-factor setting updated" });
  }),

  listPermissions: asyncHandler(async (_req, res) => {
    const permissions = authService.listAvailablePermissions();
    sendSuccess(res, { data: permissions });
  }),

  listAdmins: asyncHandler(async (_req, res) => {
    const admins = await authService.listAdmins();
    sendSuccess(res, { data: admins });
  }),

  createAdmin: asyncHandler(async (req, res) => {
    const admin = await authService.createAdmin(req.body);
    sendSuccess(res, { data: admin, message: "Admin account created", status: 201 });
  }),

  updateAdmin: asyncHandler(async (req, res) => {
    const admin = await authService.updateAdmin(req.params.id, req.body, req.user._id);
    sendSuccess(res, { data: admin, message: "Admin account updated" });
  }),

  deleteAdmin: asyncHandler(async (req, res) => {
    const result = await authService.deleteAdmin(req.params.id, req.user._id);
    sendSuccess(res, { data: result, message: result.message });
  }),

  listTeam: asyncHandler(async (_req, res) => {
    const team = await authService.listAdmins();
    sendSuccess(res, { data: team });
  }),

  createTeamMember: asyncHandler(async (req, res) => {
    const member = await authService.createAdmin(req.body);
    sendSuccess(res, { data: member, message: "Admin account created", status: 201 });
  }),

  updateTeamMember: asyncHandler(async (req, res) => {
    const member = await authService.updateAdmin(req.params.id, req.body, req.user._id);
    sendSuccess(res, { data: member, message: "Admin account updated" });
  }),

  deleteTeamMember: asyncHandler(async (req, res) => {
    const result = await authService.deleteAdmin(req.params.id, req.user._id);
    sendSuccess(res, { data: result, message: result.message });
  }),
};

module.exports = authController;
