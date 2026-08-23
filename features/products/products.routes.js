const express = require("express");
const productsController = require("./products.controller");
const { protect } = require("../../shared/middleware/auth.middleware");

const router = express.Router();

router.use(protect);

router.get("/", productsController.list);
router.post("/", productsController.create);
// Static paths before param routes
router.patch("/bulk/status", productsController.bulkUpdateStatus);
router.get("/:id", productsController.getById);
router.put("/:id", productsController.update);
router.patch("/:id", productsController.update);
router.delete("/:id", productsController.remove);
router.post("/:id/images", productsController.uploadImages);
router.delete("/:id/images", productsController.removeImage);

module.exports = router;
