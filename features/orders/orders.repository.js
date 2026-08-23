const Order = require("./orders.model");

const ordersRepository = {
  findAll: (filter, { skip, limit, sort }) =>
    Order.find(filter).sort(sort).skip(skip).limit(limit),
  count: (filter) => Order.countDocuments(filter),
  findById: (id) => Order.findById(id).populate("customerId", "name email avatar status"),
  create: (data) => Order.create(data),
  updateById: (id, data) => Order.findByIdAndUpdate(id, data, { new: true, runValidators: true }),
  deleteById: (id) => Order.findByIdAndDelete(id),
  bulkUpdateFulfillment: (ids, status) =>
    Order.updateMany({ _id: { $in: ids } }, { fulfillmentStatus: status }),
  getRecent: (limit = 10) => Order.find().sort({ createdAt: -1 }).limit(limit),
  aggregateRevenue: (startDate, endDate) =>
    Order.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate }, paymentStatus: "paid" } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$total" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  countToday: () => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return Order.countDocuments({ createdAt: { $gte: start } });
  },
  countByStatus: (field, status) => Order.countDocuments({ [field]: status }),
  sumRefunds: () => Order.aggregate([{ $group: { _id: null, total: { $sum: "$refundAmount" } } }]),
};

module.exports = ordersRepository;
