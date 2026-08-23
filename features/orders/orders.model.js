const mongoose = require("mongoose");
const { PAYMENT_STATUS, FULFILLMENT_STATUS } = require("../../shared/constants/orderStatus");

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    name: { type: String, required: true },
    sku: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, default: null },
    variant: { size: String, color: String },
  },
  { _id: true }
);

const addressSchema = new mongoose.Schema(
  {
    fullName: String,
    line1: String,
    line2: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
    phone: String,
  },
  { _id: false }
);

const timelineSchema = new mongoose.Schema(
  {
    action: { type: String, required: true },
    note: { type: String, default: "" },
    by: { type: String, default: "system" },
    at: { type: Date, default: Date.now },
  },
  { _id: true }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    items: [orderItemSchema],
    itemCount: { type: Number, default: 0 },
    subtotal: { type: Number, required: true, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    shipping: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    paymentStatus: { type: String, enum: Object.values(PAYMENT_STATUS), default: PAYMENT_STATUS.PENDING },
    fulfillmentStatus: { type: String, enum: Object.values(FULFILLMENT_STATUS), default: FULFILLMENT_STATUS.PENDING },
    paymentMethod: { type: String, default: "card" },
    shippingAddress: addressSchema,
    billingAddress: addressSchema,
    internalNotes: [{ note: String, by: String, at: { type: Date, default: Date.now } }],
    timeline: [timelineSchema],
    refundAmount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
