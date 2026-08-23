const notificationsService = require("./notifications.service");
const { sendSuccess } = require("../../shared/utils/apiResponse");
const asyncHandler = require("../../shared/utils/asyncHandler");

const notificationsController = {
  getSettings: asyncHandler(async (req, res) => {
    const settings = await notificationsService.getSettings();
    sendSuccess(res, { data: settings });
  }),

  updateSettings: asyncHandler(async (req, res) => {
    const settings = await notificationsService.updateSettings(req.body);
    sendSuccess(res, { data: settings, message: "Notification settings updated" });
  }),

  updatePreference: asyncHandler(async (req, res) => {
    const settings = await notificationsService.updatePreference(req.params.eventType, req.body);
    sendSuccess(res, { data: settings, message: "Preference updated" });
  }),

  getHistory: asyncHandler(async (req, res) => {
    const result = await notificationsService.getHistory(req.query);
    sendSuccess(res, { data: result.items, meta: { ...result.meta, unreadCount: result.unreadCount } });
  }),

  markAsRead: asyncHandler(async (req, res) => {
    const log = await notificationsService.markAsRead(req.params.id);
    sendSuccess(res, { data: log, message: "Notification marked as read" });
  }),

  markAllRead: asyncHandler(async (req, res) => {
    const result = await notificationsService.markAllRead();
    sendSuccess(res, { data: result, message: result.message });
  }),
};

module.exports = notificationsController;
