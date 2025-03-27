const express = require("express");
const router = express.Router();
const Movie = require("../models/Movie.model");
const Series = require("../models/Series.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");
const axios = require("axios");
require('dotenv').config();

router.get("/movies", isAuthenticated, async (req, res) => {
  try {
    const userId = req.payload._id;
    const movies = await Movie.find({ user: userId });
    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving movies", error });
  }
});

router.get("/movies/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const movie = await Movie.findById(id);
    
    if (!movie) {
      return res.status(404).json({ message: "Película no encontrada" });
    }

    res.json(movie);
  } catch (error) {
    console.error("Error obteniendo la película:", error);
    res.status(500).json({ message: "Error obteniendo la película", error });
  }
});

router.post("/movies/search", isAuthenticated, async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('User ID:', req.payload._id);
    console.log('TMDB API Key:', process.env.TMDB_API_KEY ? 'Exists' : 'Missing');

    const { query, tmdbId } = req.body;
    const userId = req.payload._id;

    if (!query || !tmdbId) {
      return res.status(400).json({ 
        message: "Se requieren tanto el título como el ID de TMDB" 
      });
    }

    // Primero verifica si la película ya existe
    let existingMovie = await Movie.findOne({ tmdbId, user: userId });
    if (existingMovie) {
      return res.json(existingMovie);
    }

    // Si no existe, obtén los detalles directamente usando tmdbId
    try {
      const detailsResponse = await axios.get(
        `https://api.themoviedb.org/3/movie/${tmdbId}`,
        {
          params: {
            api_key: process.env.TMDB_API_KEY,
            language: "es-ES",
            append_to_response: "credits",
          },
        }
      );

      const movieData = detailsResponse.data;
      const { credits, backdrop_path, vote_average, runtime } = movieData;

      const newMovie = new Movie({
        tmdbId,
        title: movieData.title,
        description: movieData.overview,
        releaseDate: new Date(movieData.release_date),
        genre: movieData.genres.map(g => g.name),
        poster: movieData.poster_path ? 
          `https://image.tmdb.org/t/p/w500${movieData.poster_path}` : null,
        backdrop: backdrop_path ? 
          `https://image.tmdb.org/t/p/w1280${backdrop_path}` : null,
        rating: vote_average,
        runtime: runtime,
        cast: credits.cast.slice(0, 5).map((actor) => actor.name),
        director: credits.crew.find((member) => member.job === "Director")?.name || null,
        user: userId,
        status: 'pending'
      });

      await newMovie.save();
      res.json(newMovie);
    } catch (tmdbError) {
      console.error("Error con la API de TMDB:", tmdbError);
      console.log(tmdbError.response?.data || "No response data available")
      return res.status(500).json({ 
        message: "Error obteniendo detalles de la película de TMDB",
        error: tmdbError.message 
      });
    }
  } catch (error) {
    console.error("Error guardando película:", error);
    res.status(500).json({ 
      message: "Error interno del servidor", 
      error: error.message 
    });
  }
});

router.delete("/movies/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedMovie = await Movie.findByIdAndDelete(id);
    
    if (!deletedMovie) {
      return res.status(404).json({ message: "Película no encontrada" });
    }

    res.json({ message: "Película eliminada correctamente" });
  } catch (error) {
    console.error("Error eliminando la película:", error);
    res.status(500).json({ message: "Error eliminando la película", error });
  }
});

router.get("/allmedia", isAuthenticated, async (req, res) => {
  try {
    const movies = await Movie.find().populate('user', 'name');
    const series = await Series.find().populate('user', 'name');
    
    const allMedia = [...movies, ...series].sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.json(allMedia);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving media", error });
  }
});

router.put("/movies/:id/status", isAuthenticated, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['favorite', 'pending', 'viewed'].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const updatedMovie = await Movie.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedMovie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    res.json(updatedMovie);
  } catch (error) {
    next(error);
  }
});

router.put("/movies/:id/comment", isAuthenticated, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    const updatedMovie = await Movie.findByIdAndUpdate(
      id,
      { comment },
      { new: true }
    );

    if (!updatedMovie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    res.json(updatedMovie);
  } catch (error) {
    next(error);
  }
});

router.get("/feed", isAuthenticated, async (req, res) => {
  try {
    const movies = await Movie.find({ comment: { $ne: "" } }).populate('user', 'name');
    const series = await Series.find({ comment: { $ne: "" } }).populate('user', 'name');
    
    const allMedia = [...movies, ...series].sort((a, b) => 
      new Date(b.updatedAt) - new Date(a.updatedAt)
    );

    res.json(allMedia);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving media with comments", error });
  }
});

module.exports = router;
