// routes/moviesRoute.js
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Movie = require("../model/Movies");
const HandleAsync = require("../utils/ErrorHandlers/HandleAsync");
const AppError = require("../utils/ErrorHandlers/AppError");

// GET all movies with optional query params
router.get(
  "/movies",
  HandleAsync(async (req, res, next) => {
    const { limit = 10, page = 1, title } = req.query;

    const query = {};
    if (title) {
      query.title = { $regex: title, $options: "i" }; // case-insensitive search
    }

    const movies = await Movie.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({
      status: "success",
      count: movies.length,
      data: movies,
    });
  })
);

// GET a single movie by ID
router.get(
  "/movies/:id",
  HandleAsync(async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(new AppError("Invalid movie ID", 400));
    }

    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return next(new AppError("Movie not found", 404));
    }

    res.status(200).json({
      status: "success",
      data: movie,
    });
  })
);

// CREATE a new movie
router.post(
  "/movies",
  HandleAsync(async (req, res, next) => {
    const movie = await Movie.create(req.body);
    res.status(201).json({
      status: "success",
      data: movie,
    });
  })
);

// UPDATE (replace) a movie
router.put(
  "/movies/:id",
  HandleAsync(async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(new AppError("Invalid movie ID", 400));
    }

    const updatedMovie = await Movie.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true, overwrite: true }
    );

    if (!updatedMovie) {
      return next(new AppError("Movie not found", 404));
    }

    res.status(200).json({
      status: "success",
      data: updatedMovie,
    });
  })
);

// PARTIAL UPDATE a movie
router.patch(
  "/movies/:id",
  HandleAsync(async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(new AppError("Invalid movie ID", 400));
    }

    const updatedMovie = await Movie.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedMovie) {
      return next(new AppError("Movie not found", 404));
    }

    res.status(200).json({
      status: "success",
      data: updatedMovie,
    });
  })
);

// DELETE a movie
router.delete(
  "/movies/:id",
  HandleAsync(async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(new AppError("Invalid movie ID", 400));
    }

    const deletedMovie = await Movie.findByIdAndDelete(req.params.id);
    if (!deletedMovie) {
      return next(new AppError("Movie not found", 404));
    }

    res.status(204).json({
      status: "success",
      msg: "Movie deleted successfully",
    });
  })
);

module.exports = router;
