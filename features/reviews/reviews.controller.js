const reviewsService = require("./reviews.service");
const { sendSuccess } = require("../../shared/utils/apiResponse");
const asyncHandler = require("../../shared/utils/asyncHandler");

const reviewsController = {
  list: asyncHandler(async (req, res) => {
    const result = await reviewsService.list(req.query);
    sendSuccess(res, { data: result.items, meta: result.meta });
  }),

  getById: asyncHandler(async (req, res) => {
    const review = await reviewsService.getById(req.params.id);
    sendSuccess(res, { data: review });
  }),

  getByProduct: asyncHandler(async (req, res) => {
    const reviews = await reviewsService.getByProduct(req.params.productId);
    sendSuccess(res, { data: reviews });
  }),

  create: asyncHandler(async (req, res) => {
    const review = await reviewsService.create(req.body);
    sendSuccess(res, { data: review, message: "Review created", status: 201 });
  }),

  approve: asyncHandler(async (req, res) => {
    const review = await reviewsService.approve(req.params.id);
    sendSuccess(res, { data: review, message: "Review approved" });
  }),

  reject: asyncHandler(async (req, res) => {
    const review = await reviewsService.reject(req.params.id);
    sendSuccess(res, { data: review, message: "Review rejected" });
  }),

  flag: asyncHandler(async (req, res) => {
    const review = await reviewsService.flag(req.params.id);
    sendSuccess(res, { data: review, message: "Review flagged" });
  }),

  remove: asyncHandler(async (req, res) => {
    const result = await reviewsService.remove(req.params.id);
    sendSuccess(res, { data: result, message: result.message });
  }),
};

module.exports = reviewsController;
