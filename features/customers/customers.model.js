const mongoose = require("mongoose");
const { CUSTOMER_STATUS } = require("./customers.constants");

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, default: "Home" },
    fullName: String,
    line1: String,
    line2: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
    phone: String,
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, default: null },
    avatar: { type: String, default: null },
    status: { type: String, enum: Object.values(CUSTOMER_STATUS), default: CUSTOMER_STATUS.ACTIVE },
    addresses: [addressSchema],
    notes: [{ note: String, by: String, at: { type: Date, default: Date.now } }],
    totalOrders: { type: Number, default: 0, min: 0 },
    totalSpent: { type: Number, default: 0, min: 0 },
    joinDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Customer", customerSchema);
