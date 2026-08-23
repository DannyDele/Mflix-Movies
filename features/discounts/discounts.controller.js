const discountsService = require("./discounts.service");
const { sendSuccess } = require("../../shared/utils/apiResponse");
const asyncHandler = require("../../shared/utils/asyncHandler");

const discountsController = {
  list: asyncHandler(async (req, res) => {
    const result = await discountsService.list(req.query);
    sendSuccess(res, { data: result.items, meta: result.meta });
  }),

  getById: asyncHandler(async (req, res) => {
    const coupon = await discountsService.getById(req.params.id);
    sendSuccess(res, { data: coupon });
  }),

  create: asyncHandler(async (req, res) => {
    const coupon = await discountsService.create(req.body);
    sendSuccess(res, { data: coupon, message: "Coupon created", status: 201 });
  }),

  update: asyncHandler(async (req, res) => {
    const coupon = await discountsService.update(req.params.id, req.body);
    sendSuccess(res, { data: coupon, message: "Coupon updated" });
  }),

  remove: asyncHandler(async (req, res) => {
    const result = await discountsService.remove(req.params.id);
    sendSuccess(res, { data: result, message: result.message });
  }),

  validate: asyncHandler(async (req, res) => {
    const result = await discountsService.validateCode(req.body.code, req.body.orderTotal);
    sendSuccess(res, { data: result });
  }),
};

module.exports = discountsController;
