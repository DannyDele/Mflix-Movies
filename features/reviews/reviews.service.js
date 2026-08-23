const AppError = require("../../shared/utils/AppError");
const { parsePagination, buildMeta } = require("../../shared/utils/pagination");
const reviewsRepository = require("./reviews.repository");
const { REVIEW_STATUS } = require("./reviews.constants");

const buildReviewFilter = (query) => {
  const filter = {};
  if (query.search) {
    filter.$or = [
      { customerName: { $regex: query.search, $options: "i" } },
      { comment: { $regex: query.search, $options: "i" } },
      { productName: { $regex: query.search, $options: "i" } },
    ];
  }
  if (query.status) filter.status = query.status;
  if (query.rating) filter.rating = Number(query.rating);
  if (query.productId) filter.productId = query.productId;
  return filter;
};

const reviewsService = {
  async list(query) {
    const { page, limit, skip, sort } = parsePagination(query);
    const filter = buildReviewFilter(query);
    const [items, total] = await Promise.all([
      reviewsRepository.findAll(filter, { skip, limit, sort }),
      reviewsRepository.count(filter),
    ]);
    return { items, meta: buildMeta(total, page, limit) };
  },

  async getById(id) {
    const review = await reviewsRepository.findById(id);
    if (!review) throw new AppError("Review not found", 404);
    return review;
  },

  async getByProduct(productId) {
    return reviewsRepository.findByProduct(productId);
  },

  async create(data) {
    return reviewsRepository.create(data);
  },

  async updateStatus(id, status) {
    if (!Object.values(REVIEW_STATUS).includes(status)) {
      throw new AppError("Invalid review status", 400);
    }
    const review = await reviewsRepository.updateById(id, { status });
    if (!review) throw new AppError("Review not found", 404);
    return review;
  },

  async approve(id) {
    return this.updateStatus(id, REVIEW_STATUS.PUBLISHED);
  },

  async reject(id) {
    return this.updateStatus(id, REVIEW_STATUS.REJECTED);
  },

  async flag(id) {
    return this.updateStatus(id, REVIEW_STATUS.FLAGGED);
  },

  async remove(id) {
    const review = await reviewsRepository.deleteById(id);
    if (!review) throw new AppError("Review not found", 404);
    return { message: "Review deleted" };
  },
};

module.exports = reviewsService;
