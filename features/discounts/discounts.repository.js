const Coupon = require("./discounts.model");

const discountsRepository = {
  findAll: (filter, { skip, limit, sort }) =>
    Coupon.find(filter).sort(sort).skip(skip).limit(limit),
  count: (filter) => Coupon.countDocuments(filter),
  findById: (id) => Coupon.findById(id),
  findByCode: (code) => Coupon.findOne({ code: code.toUpperCase() }),
  create: (data) => Coupon.create(data),
  updateById: (id, data) => Coupon.findByIdAndUpdate(id, data, { new: true, runValidators: true }),
  deleteById: (id) => Coupon.findByIdAndDelete(id),
};

module.exports = discountsRepository;
