const express = require("express");
const notificationsController = require("./notifications.controller");
const { protect } = require("../../shared/middleware/auth.middleware");

const router = express.Router();

router.use(protect);

router.get("/settings", notificationsController.getSettings);
router.put("/settings", notificationsController.updateSettings);
router.patch("/settings/:eventType", notificationsController.updatePreference);
router.get("/history", notificationsController.getHistory);
// Static path before :id
router.patch("/history/read-all", notificationsController.markAllRead);
router.patch("/history/:id/read", notificationsController.markAsRead);

module.exports = router;
