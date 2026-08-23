const mongoose = require("mongoose");
const { NOTIFICATION_TYPES, NOTIFICATION_CHANNELS } = require("./notifications.constants");

const preferenceSchema = new mongoose.Schema(
  {
    eventType: { type: String, enum: Object.values(NOTIFICATION_TYPES), required: true },
    enabled: { type: Boolean, default: true },
    channels: {
      push: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
      in_app: { type: Boolean, default: true },
    },
  },
  { _id: false }
);

const notificationSettingsSchema = new mongoose.Schema(
  {
    masterPushEnabled: { type: Boolean, default: true },
    preferences: [preferenceSchema],
  },
  { timestamps: true }
);

const notificationLogSchema = new mongoose.Schema(
  {
    type: { type: String, enum: Object.values(NOTIFICATION_TYPES), required: true },
    channel: { type: String, enum: Object.values(NOTIFICATION_CHANNELS), default: "in_app" },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

module.exports = {
  NotificationSettings: mongoose.model("NotificationSettings", notificationSettingsSchema),
  NotificationLog: mongoose.model("NotificationLog", notificationLogSchema),
};
