const { PERMISSION_LIST } = require("../../shared/constants/permissions");

const AUTH_EVENTS = {
  LOGIN: "login",
  LOGOUT: "logout",
  PASSWORD_CHANGED: "password_changed",
};

/** Bootstrap seed account — only used by `npm run seed` */
const DEFAULT_ADMIN = {
  name: "Super Admin",
  email: "admin@store.com",
  password: "Admin@123",
  isSuperAdmin: true,
  isAdmin: true,
  permissions: [...PERMISSION_LIST],
};

module.exports = { AUTH_EVENTS, DEFAULT_ADMIN };
