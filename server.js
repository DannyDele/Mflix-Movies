const path = require("path");
const dotenv = require("dotenv");

const envFile = `.env.${process.env.NODE_ENV || "development"}`;
console.log("Loading env file:", envFile);

dotenv.config({ path: envFile });

// fallback if still missing
if (!process.env.MONGO_URI) {
  dotenv.config({ path: ".env" });
}

var bodyParser = require("body-parser");
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const ejs = require("ejs");
const methodOverride = require("method-override");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerBaseConfig = require("./config/swagger");

const PORT = process.env.PORT || 8080;

// route imports
const movieRoute = require("./routes/movie"); // <-- added

app.set("view engine", "ejs");
app.use(express.static("public"));
app.set("views", path.join(__dirname, "/views"));

// set up bodyparser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());
app.use(methodOverride("_method"));

// Enable CORS
app.use(cors());

// Swagger setup
const moviesSpec = YAML.load(path.join(__dirname, "doc", "movies.yml"));
const mergedSpec = {
  ...moviesSpec,
  openapi: swaggerBaseConfig.openapi || moviesSpec.openapi,
  info: swaggerBaseConfig.info || moviesSpec.info,
  servers: swaggerBaseConfig.servers || moviesSpec.servers,
};
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(mergedSpec, { customSiteTitle: "Mflix Movies API Docs" })
);

// Database connection
async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB database Connection Established Successfully!!");
  } catch (error) {
    console.error("MongoDB database Connection Failed:", error);
  }
}
connectToDatabase();

// routes

app.use("/", movieRoute); // <-- added

// Error Handle Middleware
app.use((err, req, res, next) => {
  const { message = "something went wrong", status = 500 } = err;
  res.status(status).send({ msg: message });
  console.log(err);
});

app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT} `);
});
