const Product = require("./products.model");

const productsRepository = {
  findAll: (filter, { skip, limit, sort }) =>
    Product.find(filter).sort(sort).skip(skip).limit(limit),
  count: (filter) => Product.countDocuments(filter),
  findById: (id) => Product.findById(id),
  findBySku: (sku) => Product.findOne({ sku: sku.toUpperCase() }),
  create: (data) => Product.create(data),
  updateById: (id, data) => Product.findByIdAndUpdate(id, data, { new: true, runValidators: true }),
  deleteById: (id) => Product.findByIdAndDelete(id),
  bulkUpdateStatus: (ids, status) => Product.updateMany({ _id: { $in: ids } }, { status }),
  getLowStock: (threshold = 10) =>
    Product.find({ stock: { $lte: threshold }, status: { $ne: "draft" } }).sort({ stock: 1 }),
  getTopSelling: (limit = 5) => Product.find().sort({ totalSold: -1 }).limit(limit),
  aggregateByCategory: () =>
    Product.aggregate([
      { $group: { _id: "$category", revenue: { $sum: { $multiply: ["$price", "$totalSold"] } }, count: { $sum: 1 } } },
      { $sort: { revenue: -1 } },
    ]),
};

module.exports = productsRepository;
