const productsService = require("./products.service");
const { sendSuccess } = require("../../shared/utils/apiResponse");
const asyncHandler = require("../../shared/utils/asyncHandler");
const { createUploader, toPublicUrl } = require("../../shared/middleware/upload.middleware");

const uploadProductImages = createUploader("products", { maxCount: 8 });

const productsController = {
  list: asyncHandler(async (req, res) => {
    const result = await productsService.list(req.query);
    sendSuccess(res, { data: result.items, meta: result.meta });
  }),

  getById: asyncHandler(async (req, res) => {
    const product = await productsService.getById(req.params.id);
    sendSuccess(res, { data: product });
  }),

  create: asyncHandler(async (req, res) => {
    const product = await productsService.create(req.body);
    sendSuccess(res, { data: product, message: "Product created", status: 201 });
  }),

  update: asyncHandler(async (req, res) => {
    const product = await productsService.update(req.params.id, req.body);
    sendSuccess(res, { data: product, message: "Product updated" });
  }),

  remove: asyncHandler(async (req, res) => {
    const result = await productsService.remove(req.params.id);
    sendSuccess(res, { data: result, message: result.message });
  }),

  bulkUpdateStatus: asyncHandler(async (req, res) => {
    const result = await productsService.bulkUpdateStatus(req.body.ids, req.body.status);
    sendSuccess(res, { data: result, message: result.message });
  }),

  uploadImages: [
    uploadProductImages,
    asyncHandler(async (req, res) => {
      const urls = (req.files || []).map((f) => toPublicUrl(req, "products", f.filename));
      const product = await productsService.addImages(req.params.id, urls);
      sendSuccess(res, { data: product, message: "Images uploaded" });
    }),
  ],

  removeImage: asyncHandler(async (req, res) => {
    const product = await productsService.removeImage(req.params.id, req.body.imageUrl);
    sendSuccess(res, { data: product, message: "Image removed" });
  }),
};

module.exports = productsController;
