const AppError = require("../../shared/utils/AppError");
const { parsePagination, buildMeta } = require("../../shared/utils/pagination");
const inventoryRepository = require("./inventory.repository");
const { STOCK_ADJUSTMENT_TYPES } = require("./inventory.constants");
const { PRODUCT_STATUS } = require("../products/products.constants");

const buildInventoryFilter = (query) => {
  const filter = {};
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: "i" } },
      { sku: { $regex: query.search, $options: "i" } },
    ];
  }
  if (query.stockLevel === "low") filter.stock = { $gt: 0, $lte: 10 };
  if (query.stockLevel === "out") filter.stock = 0;
  if (query.category) filter.category = query.category;
  return filter;
};

const inventoryService = {
  async listStock(query) {
    const { page, limit, skip, sort } = parsePagination(query);
    const filter = buildInventoryFilter(query);
    const [items, total] = await Promise.all([
      inventoryRepository.getStockLevels(filter, { skip, limit, sort: sort.stock ? sort : { stock: 1 } }),
      inventoryRepository.countProducts(filter),
    ]);

    const enriched = items.map((p) => ({
      ...p.toObject(),
      stockLevel: p.stock === 0 ? "out_of_stock" : p.stock <= p.lowStockThreshold ? "low" : "healthy",
    }));

    return { items: enriched, meta: buildMeta(total, page, limit) };
  },

  async adjustStock(productId, { quantityChange, type, note }, adminName = "admin") {
    const product = await inventoryRepository.findProductById(productId);
    if (!product) throw new AppError("Product not found", 404);

    const previousStock = product.stock;
    const newStock = Math.max(0, previousStock + quantityChange);

    if (newStock === 0) {
      product.status = PRODUCT_STATUS.OUT_OF_STOCK;
    } else if (product.status === PRODUCT_STATUS.OUT_OF_STOCK) {
      product.status = PRODUCT_STATUS.ACTIVE;
    }

    product.stock = newStock;
    await product.save();

    await inventoryRepository.createStockLog({
      productId: product._id,
      productName: product.name,
      sku: product.sku,
      type: type || STOCK_ADJUSTMENT_TYPES.ADJUSTMENT,
      quantityChange,
      previousStock,
      newStock,
      note,
      by: adminName,
    });

    return product;
  },

  async restock(productId, { quantity, note }, adminName = "admin") {
    if (!quantity || quantity <= 0) throw new AppError("Restock quantity must be positive", 400);
    return this.adjustStock(
      productId,
      { quantityChange: quantity, type: STOCK_ADJUSTMENT_TYPES.RESTOCK, note },
      adminName
    );
  },

  async getHistory(query) {
    const { page, limit, skip } = parsePagination(query);
    const filter = {};
    if (query.productId) filter.productId = query.productId;
    if (query.type) filter.type = query.type;

    const [items, total] = await Promise.all([
      inventoryRepository.getStockHistory(filter, { skip, limit }),
      inventoryRepository.countStockHistory(filter),
    ]);
    return { items, meta: buildMeta(total, page, limit) };
  },

  async getProductHistory(productId) {
    return inventoryRepository.getProductStockHistory(productId);
  },
};

module.exports = inventoryService;
