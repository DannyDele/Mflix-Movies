const Product = require("../products/products.model");
const { StockLog } = require("./inventory.model");

const inventoryRepository = {
  getStockLevels: (filter, { skip, limit, sort }) =>
    Product.find(filter, "name sku category stock lowStockThreshold status images")
      .sort(sort)
      .skip(skip)
      .limit(limit),
  countProducts: (filter) => Product.countDocuments(filter),
  findProductById: (id) => Product.findById(id),
  updateProductStock: (id, stock) => Product.findByIdAndUpdate(id, { stock }, { new: true }),
  createStockLog: (data) => StockLog.create(data),
  getStockHistory: (filter, { skip, limit }) =>
    StockLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
  countStockHistory: (filter) => StockLog.countDocuments(filter),
  getProductStockHistory: (productId, limit = 20) =>
    StockLog.find({ productId }).sort({ createdAt: -1 }).limit(limit),
};

module.exports = inventoryRepository;
