const express = require("express");
const discountsController = require("./discounts.controller");
const { protect } = require("../../shared/middleware/auth.middleware");

const router = express.Router();

router.use(protect);

router.get("/", discountsController.list);
router.post("/validate", discountsController.validate);
router.get("/:id", discountsController.getById);
router.post("/", discountsController.create);
router.put("/:id", discountsController.update);
router.patch("/:id", discountsController.update);
router.delete("/:id", discountsController.remove);

module.exports = router;
