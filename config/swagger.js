// Swagger/OpenAPI base configuration for Ecommerce Admin API
module.exports = {
  openapi: "3.0.3",
  info: {
    title: "Ecommerce Admin API",
    description:
      "REST API for the ecommerce admin dashboard — orders, products, customers, inventory, discounts, reviews, analytics, notifications, and settings.",
    version: "1.0.0",
  },
  servers: [
    {
      url: process.env.BASE_URL || `http://localhost:${process.env.PORT || 8080}`,
      description: process.env.NODE_ENV === "production" ? "Production server" : "Local server",
    },
  ],
};
