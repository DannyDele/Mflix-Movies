const Order = require("../orders/orders.model");
const Product = require("../products/products.model");
const Customer = require("../customers/customers.model");

const analyticsRepository = {
  revenueByDate: (start, end) =>
    Order.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end }, paymentStatus: { $in: ["paid", "partially_refunded"] } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$total" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),

  salesByChannel: () =>
    Order.aggregate([
      { $match: { paymentStatus: { $in: ["paid", "partially_refunded"] } } },
      { $group: { _id: "$paymentMethod", revenue: { $sum: "$total" }, orders: { $sum: 1 } } },
      { $sort: { revenue: -1 } },
    ]),

  topProducts: (limit = 10) => Product.find().sort({ totalSold: -1 }).limit(limit),
  worstProducts: (limit = 10) => Product.find({ totalSold: { $gt: 0 } }).sort({ totalSold: 1 }).limit(limit),
  topCustomers: (limit = 10) => Customer.find().sort({ totalSpent: -1 }).limit(limit),

  orderStats: (start, end) =>
    Order.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: { $cond: [{ $in: ["$paymentStatus", ["paid", "partially_refunded"]] }, "$total", 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ["$fulfillmentStatus", "cancelled"] }, 1, 0] } },
          refunded: { $sum: { $cond: [{ $gt: ["$refundAmount", 0] }, 1, 0] } },
        },
      },
    ]),
};

module.exports = analyticsRepository;
