const AppError = require("../../shared/utils/AppError");
const { parsePagination, buildMeta } = require("../../shared/utils/pagination");
const productsRepository = require("./products.repository");
const { PRODUCT_STATUS } = require("./products.constants");

const buildProductFilter = (query) => {
  const filter = {};

  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: "i" } },
      { sku: { $regex: query.search, $options: "i" } },
      { tags: { $regex: query.search, $options: "i" } },
    ];
  }
  if (query.category) filter.category = query.category;
  if (query.status) filter.status = query.status;
  if (query.stockStatus === "low") filter.stock = { $lte: 10, $gt: 0 };
  if (query.stockStatus === "out") filter.stock = 0;
  if (query.minPrice || query.maxPrice) {
    filter.price = {};
    if (query.minPrice) filter.price.$gte = Number(query.minPrice);
    if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
  }

  return filter;
};

const resolveStatus = (stock, status) => {
  if (status === PRODUCT_STATUS.DRAFT) return PRODUCT_STATUS.DRAFT;
  if (stock <= 0) return PRODUCT_STATUS.OUT_OF_STOCK;
  return status || PRODUCT_STATUS.ACTIVE;
};

const productsService = {
  async list(query) {
    const { page, limit, skip, sort } = parsePagination(query);
    const filter = buildProductFilter(query);
    const [items, total] = await Promise.all([
      productsRepository.findAll(filter, { skip, limit, sort }),
      productsRepository.count(filter),
    ]);
    return { items, meta: buildMeta(total, page, limit) };
  },

  async getById(id) {
    const product = await productsRepository.findById(id);
    if (!product) throw new AppError("Product not found", 404);
    return product;
  },

  async create(data) {
    const existing = await productsRepository.findBySku(data.sku);
    if (existing) throw new AppError("SKU already exists", 409);

    const status = resolveStatus(data.stock ?? 0, data.status);
    return productsRepository.create({ ...data, status });
  },

  async update(id, data) {
    const product = await productsRepository.findById(id);
    if (!product) throw new AppError("Product not found", 404);

    if (data.sku && data.sku !== product.sku) {
      const existing = await productsRepository.findBySku(data.sku);
      if (existing) throw new AppError("SKU already exists", 409);
    }

    const stock = data.stock ?? product.stock;
    const status = resolveStatus(stock, data.status ?? product.status);
    return productsRepository.updateById(id, { ...data, status });
  },

  async remove(id) {
    const product = await productsRepository.deleteById(id);
    if (!product) throw new AppError("Product not found", 404);
    return { message: "Product deleted" };
  },

  async bulkUpdateStatus(ids, status) {
    await productsRepository.bulkUpdateStatus(ids, status);
    return { message: `${ids.length} products updated` };
  },

  async addImages(id, imageUrls) {
    const product = await productsRepository.findById(id);
    if (!product) throw new AppError("Product not found", 404);
    product.images.push(...imageUrls);
    await product.save();
    return product;
  },

  async removeImage(id, imageUrl) {
    const product = await productsRepository.findById(id);
    if (!product) throw new AppError("Product not found", 404);
    product.images = product.images.filter((img) => img !== imageUrl);
    await product.save();
    return product;
  },
};

module.exports = productsService;
