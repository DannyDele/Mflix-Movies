const mongoose = require("mongoose");

const STOCK_ADJUSTMENT_TYPES = {
  RESTOCK: "restock",
  SALE: "sale",
  ADJUSTMENT: "adjustment",
  RETURN: "return",
  DAMAGE: "damage",
};

const stockLogSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    productName: { type: String, required: true },
    sku: { type: String, required: true },
    type: { type: String, enum: Object.values(STOCK_ADJUSTMENT_TYPES), required: true },
    quantityChange: { type: Number, required: true },
    previousStock: { type: Number, required: true },
    newStock: { type: Number, required: true },
    note: { type: String, default: "" },
    by: { type: String, default: "admin" },
  },
  { timestamps: true }
);

module.exports = {
  StockLog: mongoose.model("StockLog", stockLogSchema),
  STOCK_ADJUSTMENT_TYPES,
};
