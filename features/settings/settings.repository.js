const { StoreProfile, PaymentSettings, ShippingSettings } = require("./settings.model");

const settingsRepository = {
  getStore: () => StoreProfile.findOne(),
  upsertStore: (data) =>
    StoreProfile.findOneAndUpdate({}, data, { upsert: true, new: true, setDefaultsOnInsert: true }),
  getPayments: () => PaymentSettings.findOne(),
  upsertPayments: (data) =>
    PaymentSettings.findOneAndUpdate({}, data, { upsert: true, new: true, setDefaultsOnInsert: true }),
  getShipping: () => ShippingSettings.findOne(),
  upsertShipping: (data) =>
    ShippingSettings.findOneAndUpdate({}, data, { upsert: true, new: true, setDefaultsOnInsert: true }),
};

module.exports = settingsRepository;
