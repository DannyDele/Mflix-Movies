const mongoose = require("mongoose");
const { PRODUCT_STATUS, PRODUCT_CATEGORIES } = require("./products.constants");

const variantSchema = new mongoose.Schema(
  {
    size: { type: String, default: null },
    color: { type: String, default: null },
    sku: { type: String, required: true },
    stock: { type: Number, default: 0, min: 0 },
    price: { type: Number, default: null },
  },
  { _id: true }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
    category: { type: String, enum: PRODUCT_CATEGORIES, required: true },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, default: null, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 10, min: 0 },
    tags: [{ type: String, trim: true }],
    images: [{ type: String }],
    variants: [variantSchema],
    status: { type: String, enum: Object.values(PRODUCT_STATUS), default: PRODUCT_STATUS.DRAFT },
    totalSold: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

productSchema.index({ name: "text", sku: "text", tags: "text" });

module.exports = mongoose.model("Product", productSchema);
