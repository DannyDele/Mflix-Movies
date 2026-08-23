const mongoose = require("mongoose");

const storeProfileSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    logo: { type: String, default: null },
    contactEmail: { type: String, required: true },
    contactPhone: { type: String, default: null },
    currency: { type: String, default: "USD" },
    timezone: { type: String, default: "UTC" },
    address: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },
  },
  { timestamps: true }
);

const paymentGatewaySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    label: { type: String, required: true },
    enabled: { type: Boolean, default: false },
    config: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { _id: true }
);

const shippingZoneSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    countries: [{ type: String }],
    rate: { type: Number, required: true, min: 0 },
  },
  { _id: true }
);

const paymentSettingsSchema = new mongoose.Schema(
  {
    gateways: [paymentGatewaySchema],
  },
  { timestamps: true }
);

const shippingSettingsSchema = new mongoose.Schema(
  {
    defaultRate: { type: Number, default: 5.99 },
    freeShippingThreshold: { type: Number, default: 75 },
    zones: [shippingZoneSchema],
  },
  { timestamps: true }
);

module.exports = {
  StoreProfile: mongoose.model("StoreProfile", storeProfileSchema),
  PaymentSettings: mongoose.model("PaymentSettings", paymentSettingsSchema),
  ShippingSettings: mongoose.model("ShippingSettings", shippingSettingsSchema),
};
