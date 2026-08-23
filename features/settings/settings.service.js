const AppError = require("../../shared/utils/AppError");
const settingsRepository = require("./settings.repository");
const { DEFAULT_STORE, DEFAULT_PAYMENT_GATEWAYS, DEFAULT_SHIPPING } = require("./settings.constants");

const settingsService = {
  async seedDefaults() {
    const store = await settingsRepository.getStore();
    if (!store) await settingsRepository.upsertStore(DEFAULT_STORE);

    const payments = await settingsRepository.getPayments();
    if (!payments) await settingsRepository.upsertPayments({ gateways: DEFAULT_PAYMENT_GATEWAYS });

    const shipping = await settingsRepository.getShipping();
    if (!shipping) await settingsRepository.upsertShipping(DEFAULT_SHIPPING);
  },

  async getStore() {
    let store = await settingsRepository.getStore();
    if (!store) store = await settingsRepository.upsertStore(DEFAULT_STORE);
    return store;
  },

  async updateStore(data) {
    return settingsRepository.upsertStore(data);
  },

  async getPayments() {
    let payments = await settingsRepository.getPayments();
    if (!payments) payments = await settingsRepository.upsertPayments({ gateways: DEFAULT_PAYMENT_GATEWAYS });
    return payments;
  },

  async updatePayments(data) {
    return settingsRepository.upsertPayments(data);
  },

  async toggleGateway(gatewayName, enabled) {
    const settings = await this.getPayments();
    const gateway = settings.gateways.find((g) => g.name === gatewayName);
    if (!gateway) throw new AppError("Payment gateway not found", 404);
    gateway.enabled = enabled;
    await settings.save();
    return settings;
  },

  async getShipping() {
    let shipping = await settingsRepository.getShipping();
    if (!shipping) shipping = await settingsRepository.upsertShipping(DEFAULT_SHIPPING);
    return shipping;
  },

  async updateShipping(data) {
    return settingsRepository.upsertShipping(data);
  },

  async getAll() {
    const [store, payments, shipping] = await Promise.all([
      this.getStore(),
      this.getPayments(),
      this.getShipping(),
    ]);
    return { store, payments, shipping };
  },

  async exportData() {
    const all = await this.getAll();
    return {
      exportedAt: new Date().toISOString(),
      data: all,
      message: "Store data export ready (mock)",
    };
  },
};

module.exports = settingsService;
