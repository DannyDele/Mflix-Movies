const express = require("express");

const authRoutes = require("../features/auth/auth.routes");
const dashboardRoutes = require("../features/dashboard/dashboard.routes");
const ordersRoutes = require("../features/orders/orders.routes");
const productsRoutes = require("../features/products/products.routes");
const customersRoutes = require("../features/customers/customers.routes");
const inventoryRoutes = require("../features/inventory/inventory.routes");
const discountsRoutes = require("../features/discounts/discounts.routes");
const reviewsRoutes = require("../features/reviews/reviews.routes");
const analyticsRoutes = require("../features/analytics/analytics.routes");
const notificationsRoutes = require("../features/notifications/notifications.routes");
const settingsRoutes = require("../features/settings/settings.routes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/orders", ordersRoutes);
router.use("/products", productsRoutes);
router.use("/customers", customersRoutes);
router.use("/inventory", inventoryRoutes);
router.use("/discounts", discountsRoutes);
router.use("/reviews", reviewsRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/notifications", notificationsRoutes);
router.use("/settings", settingsRoutes);

module.exports = router;
