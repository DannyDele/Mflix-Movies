const AppError = require("../../shared/utils/AppError");
const { parsePagination, buildMeta } = require("../../shared/utils/pagination");
const notificationsRepository = require("./notifications.repository");
const { DEFAULT_PREFERENCES } = require("./notifications.constants");

const notificationsService = {
  async getSettings() {
    let settings = await notificationsRepository.getSettings();
    if (!settings) {
      settings = await notificationsRepository.upsertSettings({
        masterPushEnabled: true,
        preferences: DEFAULT_PREFERENCES,
      });
    }
    return settings;
  },

  async updateSettings(data) {
    return notificationsRepository.upsertSettings(data);
  },

  async updatePreference(eventType, updates) {
    const settings = await this.getSettings();
    const pref = settings.preferences.find((p) => p.eventType === eventType);
    if (!pref) throw new AppError("Notification event type not found", 404);

    Object.assign(pref, updates);
    if (updates.channels) Object.assign(pref.channels, updates.channels);
    await settings.save();
    return settings;
  },

  async getHistory(query) {
    const { page, limit, skip } = parsePagination(query);
    const filter = {};
    if (query.read !== undefined) filter.read = query.read === "true";
    if (query.type) filter.type = query.type;

    const [items, total, unreadCount] = await Promise.all([
      notificationsRepository.getLogs(filter, { skip, limit }),
      notificationsRepository.countLogs(filter),
      notificationsRepository.countUnread(),
    ]);

    return { items, unreadCount, meta: buildMeta(total, page, limit) };
  },

  async markAsRead(id) {
    const log = await notificationsRepository.markAsRead(id);
    if (!log) throw new AppError("Notification not found", 404);
    return log;
  },

  async markAllRead() {
    await notificationsRepository.markAllRead();
    return { message: "All notifications marked as read" };
  },

  async createLog(data) {
    return notificationsRepository.createLog(data);
  },
};

module.exports = notificationsService;
