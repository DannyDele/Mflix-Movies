const NOTIFICATION_TYPES = {
  NEW_ORDER: "new_order",
  LOW_STOCK: "low_stock",
  PAYMENT_FAILED: "payment_failed",
  NEW_REVIEW: "new_review",
  REFUND_REQUESTED: "refund_requested",
  DAILY_SUMMARY: "daily_summary",
  WEEKLY_SUMMARY: "weekly_summary",
  NEW_SIGNUP: "new_signup",
};

const NOTIFICATION_CHANNELS = {
  PUSH: "push",
  EMAIL: "email",
  IN_APP: "in_app",
};

const DEFAULT_PREFERENCES = Object.values(NOTIFICATION_TYPES).map((eventType) => ({
  eventType,
  enabled: true,
  channels: { push: true, email: true, in_app: true },
}));

module.exports = { NOTIFICATION_TYPES, NOTIFICATION_CHANNELS, DEFAULT_PREFERENCES };
