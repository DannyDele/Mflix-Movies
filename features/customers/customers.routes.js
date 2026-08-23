const express = require("express");
const customersController = require("./customers.controller");
const { protect } = require("../../shared/middleware/auth.middleware");

const router = express.Router();

router.use(protect);

router.get("/", customersController.list);
router.get("/:id", customersController.getById);
router.post("/", customersController.create);
router.put("/:id", customersController.update);
router.patch("/:id", customersController.update);
router.patch("/:id/block", customersController.toggleBlock);
router.post("/:id/notes", customersController.addNote);
router.delete("/:id", customersController.remove);

module.exports = router;
