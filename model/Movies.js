// models/Movie.js
const mongoose = require("mongoose");

// Empty schema, allows all fields
const movieSchema = new mongoose.Schema(
  {},
  { strict: false, suppressReservedKeysWarning: true }
);

// Explicitly point to "movies" collection in sample_mflix
module.exports = mongoose.model("Movie", movieSchema, "movies");
