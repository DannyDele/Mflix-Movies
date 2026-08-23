const Review = require("./reviews.model");

const reviewsRepository = {
  findAll: (filter, { skip, limit, sort }) =>
    Review.find(filter).sort(sort).skip(skip).limit(limit),
  count: (filter) => Review.countDocuments(filter),
  findById: (id) => Review.findById(id),
  findByProduct: (productId) => Review.find({ productId, status: "published" }).sort({ createdAt: -1 }),
  create: (data) => Review.create(data),
  updateById: (id, data) => Review.findByIdAndUpdate(id, data, { new: true, runValidators: true }),
  deleteById: (id) => Review.findByIdAndDelete(id),
  getAverageRating: (productId) =>
    Review.aggregate([
      { $match: { productId: productId, status: "published" } },
      { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]),
};

module.exports = reviewsRepository;
