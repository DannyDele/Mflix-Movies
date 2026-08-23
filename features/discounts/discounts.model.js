const mongoose = require("mongoose");
const { COUPON_TYPES, COUPON_STATUS } = require("./discounts.constants");

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: Object.values(COUPON_TYPES), required: true },
    value: { type: Number, required: true, min: 0 },
    usageLimit: { type: Number, default: null },
    usageCount: { type: Number, default: 0, min: 0 },
    minOrderAmount: { type: Number, default: 0, min: 0 },
    startsAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    status: { type: String, enum: Object.values(COUPON_STATUS), default: COUPON_STATUS.ACTIVE },
    applicableCategories: [{ type: String }],
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Coupon", couponSchema);
