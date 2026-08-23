const ordersService = require("./orders.service");
const { sendSuccess } = require("../../shared/utils/apiResponse");
const asyncHandler = require("../../shared/utils/asyncHandler");

const ordersController = {
  list: asyncHandler(async (req, res) => {
    const result = await ordersService.list(req.query);
    sendSuccess(res, { data: result.items, meta: result.meta });
  }),

  getById: asyncHandler(async (req, res) => {
    const order = await ordersService.getById(req.params.id);
    sendSuccess(res, { data: order });
  }),

  create: asyncHandler(async (req, res) => {
    const order = await ordersService.create(req.body);
    sendSuccess(res, { data: order, message: "Order created", status: 201 });
  }),

  updateStatus: asyncHandler(async (req, res) => {
    const order = await ordersService.updateStatus(req.params.id, req.body, req.user.name);
    sendSuccess(res, { data: order, message: "Order status updated" });
  }),

  addNote: asyncHandler(async (req, res) => {
    const order = await ordersService.addNote(req.params.id, req.body, req.user.name);
    sendSuccess(res, { data: order, message: "Note added" });
  }),

  issueRefund: asyncHandler(async (req, res) => {
    const order = await ordersService.issueRefund(req.params.id, req.body, req.user.name);
    sendSuccess(res, { data: order, message: "Refund processed" });
  }),

  bulkAction: asyncHandler(async (req, res) => {
    const result = await ordersService.bulkAction(req.body.ids, req.body.action);
    sendSuccess(res, { data: result, message: result.message });
  }),

  remove: asyncHandler(async (req, res) => {
    const result = await ordersService.remove(req.params.id);
    sendSuccess(res, { data: result, message: result.message });
  }),
};

module.exports = ordersController;
