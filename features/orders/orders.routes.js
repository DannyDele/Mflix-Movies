const express = require("express");
const ordersController = require("./orders.controller");
const { protect } = require("../../shared/middleware/auth.middleware");

const router = express.Router();

router.use(protect);

router.get("/", ordersController.list);
router.post("/", ordersController.create);
// Static paths before param routes
router.patch("/bulk", ordersController.bulkAction);
router.get("/:id", ordersController.getById);
router.patch("/:id/status", ordersController.updateStatus);
router.post("/:id/notes", ordersController.addNote);
router.post("/:id/refund", ordersController.issueRefund);
router.delete("/:id", ordersController.remove);

module.exports = router;
