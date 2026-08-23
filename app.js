const path = require("path");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerBaseConfig = require("./config/swagger");
const adminRoutes = require("./routes");
const { UPLOAD_ROOT } = require("./shared/middleware/upload.middleware");

const createApp = () => {
  const app = express();

  const clientOrigin = process.env.CLIENT_URL || "http://localhost:5173";

  // credentials: true required so browser stores/sends httpOnly auth cookies
  app.use(
    cors({
      origin: clientOrigin,
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  app.use(cookieParser());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));

  app.use("/uploads", express.static(UPLOAD_ROOT));

  const specPath = path.join(__dirname, "doc", "admin-api.yml");
  try {
    const adminSpec = YAML.load(specPath);
    const mergedSpec = {
      ...adminSpec,
      openapi: swaggerBaseConfig.openapi || adminSpec.openapi,
      info: swaggerBaseConfig.info || adminSpec.info,
      servers: swaggerBaseConfig.servers || adminSpec.servers,
    };
    app.use(
      "/api-docs",
      swaggerUi.serve,
      swaggerUi.setup(mergedSpec, { customSiteTitle: "Ecommerce Admin API Docs" })
    );
  } catch {
    console.warn("Swagger spec not found — skipping /api-docs");
  }

  app.get("/health", (_req, res) => {
    res.json({ success: true, message: "Ecommerce Admin API is running" });
  });

  app.use("/api/v1/admin", adminRoutes);

  app.use((err, _req, res, _next) => {
    const status = err.status || 500;
    const message = err.message || "Something went wrong";
    if (status >= 500) console.error(err);
    res.status(status).json({ success: false, message });
  });

  return app;
};

module.exports = createApp;
