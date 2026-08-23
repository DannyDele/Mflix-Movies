const settingsService = require("./settings.service");
const { sendSuccess } = require("../../shared/utils/apiResponse");
const asyncHandler = require("../../shared/utils/asyncHandler");
const { createUploader, toPublicUrl } = require("../../shared/middleware/upload.middleware");

const uploadLogo = createUploader("store", { maxCount: 1, maxSizeMB: 2 });

const settingsController = {
  getAll: asyncHandler(async (req, res) => {
    const data = await settingsService.getAll();
    sendSuccess(res, { data });
  }),

  getStore: asyncHandler(async (req, res) => {
    const store = await settingsService.getStore();
    sendSuccess(res, { data: store });
  }),

  updateStore: asyncHandler(async (req, res) => {
    const store = await settingsService.updateStore(req.body);
    sendSuccess(res, { data: store, message: "Store profile updated" });
  }),

  uploadLogo: [
    uploadLogo,
    asyncHandler(async (req, res) => {
      const file = req.files?.[0];
      if (!file) {
        const AppError = require("../../shared/utils/AppError");
        throw new AppError("No file uploaded", 400);
      }
      const logoUrl = toPublicUrl(req, "store", file.filename);
      const store = await settingsService.updateStore({ logo: logoUrl });
      sendSuccess(res, { data: store, message: "Logo uploaded" });
    }),
  ],

  getPayments: asyncHandler(async (req, res) => {
    const payments = await settingsService.getPayments();
    sendSuccess(res, { data: payments });
  }),

  updatePayments: asyncHandler(async (req, res) => {
    const payments = await settingsService.updatePayments(req.body);
    sendSuccess(res, { data: payments, message: "Payment settings updated" });
  }),

  toggleGateway: asyncHandler(async (req, res) => {
    const payments = await settingsService.toggleGateway(req.params.gateway, req.body.enabled);
    sendSuccess(res, { data: payments, message: "Gateway toggled" });
  }),

  getShipping: asyncHandler(async (req, res) => {
    const shipping = await settingsService.getShipping();
    sendSuccess(res, { data: shipping });
  }),

  updateShipping: asyncHandler(async (req, res) => {
    const shipping = await settingsService.updateShipping(req.body);
    sendSuccess(res, { data: shipping, message: "Shipping settings updated" });
  }),

  exportData: asyncHandler(async (req, res) => {
    const data = await settingsService.exportData();
    sendSuccess(res, { data, message: data.message });
  }),
};

module.exports = settingsController;
