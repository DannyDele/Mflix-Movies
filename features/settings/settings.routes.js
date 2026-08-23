const express = require("express");
const settingsController = require("./settings.controller");
const {
  protect,
  requireSuperAdmin,
  requirePermission,
} = require("../../shared/middleware/auth.middleware");
const { PERMISSIONS } = require("../../shared/constants/permissions");

const router = express.Router();

router.use(protect);

router.get(
  "/",
  requirePermission(PERMISSIONS.SETTINGS_VIEW, PERMISSIONS.SETTINGS_MANAGE),
  settingsController.getAll
);
router.get(
  "/store",
  requirePermission(PERMISSIONS.SETTINGS_VIEW, PERMISSIONS.SETTINGS_MANAGE),
  settingsController.getStore
);
router.put(
  "/store",
  requirePermission(PERMISSIONS.SETTINGS_MANAGE),
  settingsController.updateStore
);
router.post(
  "/store/logo",
  requirePermission(PERMISSIONS.SETTINGS_MANAGE),
  settingsController.uploadLogo
);
router.get(
  "/payments",
  requirePermission(PERMISSIONS.SETTINGS_VIEW, PERMISSIONS.SETTINGS_MANAGE),
  settingsController.getPayments
);
router.put("/payments", requireSuperAdmin, settingsController.updatePayments);
router.patch("/payments/:gateway", requireSuperAdmin, settingsController.toggleGateway);
router.get(
  "/shipping",
  requirePermission(PERMISSIONS.SETTINGS_VIEW, PERMISSIONS.SETTINGS_MANAGE),
  settingsController.getShipping
);
router.put(
  "/shipping",
  requirePermission(PERMISSIONS.SETTINGS_MANAGE),
  settingsController.updateShipping
);
router.get("/export", requireSuperAdmin, settingsController.exportData);

module.exports = router;
