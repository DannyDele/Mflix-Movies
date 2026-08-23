const express = require("express");
const inventoryController = require("./inventory.controller");
const { protect } = require("../../shared/middleware/auth.middleware");

const router = express.Router();

router.use(protect);

router.get("/", inventoryController.listStock);
router.get("/history", inventoryController.getHistory);
router.get("/:productId/history", inventoryController.getProductHistory);
router.post("/:productId/adjust", inventoryController.adjustStock);
router.post("/:productId/restock", inventoryController.restock);

module.exports = router;
