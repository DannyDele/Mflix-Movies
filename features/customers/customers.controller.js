const customersService = require("./customers.service");
const { sendSuccess } = require("../../shared/utils/apiResponse");
const asyncHandler = require("../../shared/utils/asyncHandler");

const customersController = {
  list: asyncHandler(async (req, res) => {
    const result = await customersService.list(req.query);
    sendSuccess(res, { data: result.items, meta: result.meta });
  }),

  getById: asyncHandler(async (req, res) => {
    const details = await customersService.getDetails(req.params.id);
    sendSuccess(res, { data: details });
  }),

  create: asyncHandler(async (req, res) => {
    const customer = await customersService.create(req.body);
    sendSuccess(res, { data: customer, message: "Customer created", status: 201 });
  }),

  update: asyncHandler(async (req, res) => {
    const customer = await customersService.update(req.params.id, req.body);
    sendSuccess(res, { data: customer, message: "Customer updated" });
  }),

  toggleBlock: asyncHandler(async (req, res) => {
    const customer = await customersService.toggleBlock(req.params.id, req.body.blocked);
    sendSuccess(res, { data: customer, message: customer.status === "blocked" ? "Customer blocked" : "Customer unblocked" });
  }),

  addNote: asyncHandler(async (req, res) => {
    const customer = await customersService.addNote(req.params.id, req.body, req.user.name);
    sendSuccess(res, { data: customer, message: "Note added" });
  }),

  remove: asyncHandler(async (req, res) => {
    const result = await customersService.remove(req.params.id);
    sendSuccess(res, { data: result, message: result.message });
  }),
};

module.exports = customersController;
