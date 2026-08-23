const dotenv = require("dotenv");

const envFile = `.env.${process.env.NODE_ENV || "development"}`;
console.log("Loading env file:", envFile);
dotenv.config({ path: envFile });

if (!process.env.MONGO_URI) {
  dotenv.config({ path: ".env" });
}

const createApp = require("./app");
const connectToDatabase = require("./config/database");
const settingsService = require("./features/settings/settings.service");

const PORT = process.env.PORT || 8080;

async function bootstrap() {
  const app = createApp();

  try {
    await connectToDatabase();
    // Store settings only — admins are created via POST /auth/admins (or npm run seed)
    await settingsService.seedDefaults();
  } catch (error) {
    console.error("Startup error:", error.message);
  }

  app.listen(PORT, () => {
    console.log(`Ecommerce Admin API running on port: ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`API base: http://localhost:${PORT}/api/v1/admin`);
  });
}

bootstrap();
