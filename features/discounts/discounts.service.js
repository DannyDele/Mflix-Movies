const AppError = require("../../shared/utils/AppError");
const { parsePagination, buildMeta } = require("../../shared/utils/pagination");
const discountsRepository = require("./discounts.repository");
const { COUPON_STATUS } = require("./discounts.constants");

const resolveCouponStatus = (coupon) => {
  const now = new Date();
  if (now > coupon.expiresAt) return COUPON_STATUS.EXPIRED;
  if (now < coupon.startsAt) return COUPON_STATUS.SCHEDULED;
  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) return COUPON_STATUS.EXPIRED;
  return COUPON_STATUS.ACTIVE;
};

const buildCouponFilter = (query) => {
  const filter = {};
  if (query.search) filter.code = { $regex: query.search, $options: "i" };
  if (query.status) filter.status = query.status;
  if (query.type) filter.type = query.type;
  return filter;
};

const discountsService = {
  async list(query) {
    const { page, limit, skip, sort } = parsePagination(query);
    const filter = buildCouponFilter(query);
    const [items, total] = await Promise.all([
      discountsRepository.findAll(filter, { skip, limit, sort }),
      discountsRepository.count(filter),
    ]);
    return { items, meta: buildMeta(total, page, limit) };
  },

  async getById(id) {
    const coupon = await discountsRepository.findById(id);
    if (!coupon) throw new AppError("Coupon not found", 404);
    return coupon;
  },

  async create(data) {
    const existing = await discountsRepository.findByCode(data.code);
    if (existing) throw new AppError("Coupon code already exists", 409);
    const status = resolveCouponStatus({ ...data, usageCount: 0 });
    return discountsRepository.create({ ...data, status });
  },

  async update(id, data) {
    const coupon = await discountsRepository.findById(id);
    if (!coupon) throw new AppError("Coupon not found", 404);

    if (data.code && data.code !== coupon.code) {
      const existing = await discountsRepository.findByCode(data.code);
      if (existing) throw new AppError("Coupon code already exists", 409);
    }

    const merged = { ...coupon.toObject(), ...data };
    const status = resolveCouponStatus(merged);
    return discountsRepository.updateById(id, { ...data, status });
  },

  async remove(id) {
    const coupon = await discountsRepository.deleteById(id);
    if (!coupon) throw new AppError("Coupon not found", 404);
    return { message: "Coupon deleted" };
  },

  async validateCode(code, orderTotal = 0) {
    const coupon = await discountsRepository.findByCode(code);
    if (!coupon) throw new AppError("Invalid coupon code", 404);

    const status = resolveCouponStatus(coupon);
    if (status !== COUPON_STATUS.ACTIVE) throw new AppError("Coupon is not active", 400);
    if (orderTotal < coupon.minOrderAmount) {
      throw new AppError(`Minimum order amount is $${coupon.minOrderAmount}`, 400);
    }

    let discount = coupon.type === "percentage" ? (orderTotal * coupon.value) / 100 : coupon.value;
    discount = Math.min(discount, orderTotal);

    return { coupon, discount };
  },
};

module.exports = discountsService;
