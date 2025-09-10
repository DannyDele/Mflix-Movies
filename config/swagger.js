// Swagger/OpenAPI base configuration for Mflix Movies
module.exports = {
  openapi: "3.0.3",
  info: {
    title: "Mflix Movies API",
    description: "API endpoints for Mflix Movies operations",
    version: "1.0.0",
  },
  servers: [
    {
      url:
        process.env.BASE_URL || `http://localhost:${process.env.PORT || 8080}`,
      description:
        process.env.NODE_ENV === "production"
          ? "Production server"
          : "Local server",
    },
  ],
};
