const mongoose = require("mongoose");
const { REVIEW_STATUS } = require("./reviews.constants");

const reviewSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    productName: { type: String, required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    customerName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
    status: { type: String, enum: Object.values(REVIEW_STATUS), default: REVIEW_STATUS.PENDING },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);
