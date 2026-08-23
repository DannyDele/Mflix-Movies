const express = require("express");
const authController = require("./auth.controller");
const {
  protect,
  requireSuperAdmin,
  requirePermission,
  allowBootstrapOrSuperAdmin,
} = require("../../shared/middleware/auth.middleware");
const { PERMISSIONS } = require("../../shared/constants/permissions");

const router = express.Router();

router.post("/login", authController.login);
router.post("/refresh", authController.refresh);
// Logout clears cookies; protect is optional so expired access still clears cookies
router.post("/logout", authController.logout);
router.get("/me", protect, authController.getMe);
router.patch("/change-password", protect, authController.changePassword);
router.patch("/two-factor", protect, authController.toggleTwoFactor);

router.get(
  "/permissions",
  protect,
  requirePermission(PERMISSIONS.ADMINS_VIEW, PERMISSIONS.ADMINS_MANAGE),
  authController.listPermissions
);

router.get(
  "/admins",
  protect,
  requirePermission(PERMISSIONS.ADMINS_VIEW, PERMISSIONS.ADMINS_MANAGE),
  authController.listAdmins
);

router.post("/admins", allowBootstrapOrSuperAdmin, authController.createAdmin);
router.patch("/admins/:id", protect, requireSuperAdmin, authController.updateAdmin);
router.delete("/admins/:id", protect, requireSuperAdmin, authController.deleteAdmin);

router.get(
  "/team",
  protect,
  requirePermission(PERMISSIONS.ADMINS_VIEW, PERMISSIONS.ADMINS_MANAGE),
  authController.listTeam
);
router.post("/team", allowBootstrapOrSuperAdmin, authController.createTeamMember);
router.patch("/team/:id", protect, requireSuperAdmin, authController.updateTeamMember);
router.delete("/team/:id", protect, requireSuperAdmin, authController.deleteTeamMember);

module.exports = router;
