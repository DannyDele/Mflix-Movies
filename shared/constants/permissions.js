/**
 * Permission keys a super admin can assign to other admins.
 * Super admins bypass these checks and have full access.
 */
const PERMISSIONS = {
  DASHBOARD_VIEW: "dashboard:view",

  ORDERS_VIEW: "orders:view",
  ORDERS_MANAGE: "orders:manage",

  PRODUCTS_VIEW: "products:view",
  PRODUCTS_MANAGE: "products:manage",

  CUSTOMERS_VIEW: "customers:view",
  CUSTOMERS_MANAGE: "customers:manage",

  INVENTORY_VIEW: "inventory:view",
  INVENTORY_MANAGE: "inventory:manage",

  DISCOUNTS_VIEW: "discounts:view",
  DISCOUNTS_MANAGE: "discounts:manage",

  REVIEWS_VIEW: "reviews:view",
  REVIEWS_MANAGE: "reviews:manage",

  ANALYTICS_VIEW: "analytics:view",
  ANALYTICS_EXPORT: "analytics:export",

  NOTIFICATIONS_VIEW: "notifications:view",
  NOTIFICATIONS_MANAGE: "notifications:manage",

  SETTINGS_VIEW: "settings:view",
  SETTINGS_MANAGE: "settings:manage",

  ADMINS_VIEW: "admins:view",
  ADMINS_MANAGE: "admins:manage",
};

const PERMISSION_LIST = Object.values(PERMISSIONS);

module.exports = { PERMISSIONS, PERMISSION_LIST };
