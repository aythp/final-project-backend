const express = require("express");
const router = express.Router();
const Movie = require("../models/Movie.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");
const axios = require("axios");

router.post("/movies/search", isAuthenticated, async (req, res) => {
  try {
    const { query } = req.body;

    const response = await axios.get("https://api.themoviedb.org/3/search/movie", {
      params: {
        api_key: "4c2b98d248efaa8035b951b8303b65e7",
        query: query,
        language: "es-ES",
      },
    });

    const tmdbMovie = response.data.results[0];
    if (!tmdbMovie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    let movie = await Movie.findOne({ tmdbId: tmdbMovie.id });
    if (!movie) {

      movie = new Movie({
        tmdbId: tmdbMovie.id,
        title: tmdbMovie.title,
        description: tmdbMovie.overview,
        releaseDate: tmdbMovie.release_date,
        genre: tmdbMovie.genre_ids,
      });
      await movie.save();
    }

    res.json(movie);
  } catch (error) {
    res.status(500).json({ message: "Error searching for movie", error });
  }
});

module.exports = router;