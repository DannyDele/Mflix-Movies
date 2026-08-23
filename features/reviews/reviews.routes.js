const express = require("express");
const reviewsController = require("./reviews.controller");
const { protect } = require("../../shared/middleware/auth.middleware");

const router = express.Router();

router.use(protect);

router.get("/", reviewsController.list);
router.get("/product/:productId", reviewsController.getByProduct);
router.get("/:id", reviewsController.getById);
router.post("/", reviewsController.create);
router.patch("/:id/approve", reviewsController.approve);
router.patch("/:id/reject", reviewsController.reject);
router.patch("/:id/flag", reviewsController.flag);
router.delete("/:id", reviewsController.remove);

module.exports = router;
