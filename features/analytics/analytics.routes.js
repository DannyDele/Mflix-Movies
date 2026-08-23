const express = require("express");
const analyticsController = require("./analytics.controller");
const { protect } = require("../../shared/middleware/auth.middleware");

const router = express.Router();

router.use(protect);

router.get("/", analyticsController.getOverview);
router.get("/export", analyticsController.exportReport);

module.exports = router;
