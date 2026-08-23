const { NotificationSettings, NotificationLog } = require("./notifications.model");

const notificationsRepository = {
  getSettings: () => NotificationSettings.findOne(),
  upsertSettings: (data) =>
    NotificationSettings.findOneAndUpdate({}, data, { upsert: true, new: true, setDefaultsOnInsert: true }),
  getLogs: (filter, { skip, limit }) =>
    NotificationLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
  countLogs: (filter) => NotificationLog.countDocuments(filter),
  countUnread: () => NotificationLog.countDocuments({ read: false }),
  createLog: (data) => NotificationLog.create(data),
  markAsRead: (id) => NotificationLog.findByIdAndUpdate(id, { read: true }, { new: true }),
  markAllRead: () => NotificationLog.updateMany({ read: false }, { read: true }),
};

module.exports = notificationsRepository;
