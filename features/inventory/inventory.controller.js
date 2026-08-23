const inventoryService = require("./inventory.service");
const { sendSuccess } = require("../../shared/utils/apiResponse");
const asyncHandler = require("../../shared/utils/asyncHandler");

const inventoryController = {
  listStock: asyncHandler(async (req, res) => {
    const result = await inventoryService.listStock(req.query);
    sendSuccess(res, { data: result.items, meta: result.meta });
  }),

  adjustStock: asyncHandler(async (req, res) => {
    const product = await inventoryService.adjustStock(req.params.productId, req.body, req.user.name);
    sendSuccess(res, { data: product, message: "Stock adjusted" });
  }),

  restock: asyncHandler(async (req, res) => {
    const product = await inventoryService.restock(req.params.productId, req.body, req.user.name);
    sendSuccess(res, { data: product, message: "Product restocked" });
  }),

  getHistory: asyncHandler(async (req, res) => {
    const result = await inventoryService.getHistory(req.query);
    sendSuccess(res, { data: result.items, meta: result.meta });
  }),

  getProductHistory: asyncHandler(async (req, res) => {
    const history = await inventoryService.getProductHistory(req.params.productId);
    sendSuccess(res, { data: history });
  }),
};

module.exports = inventoryController;
