const express = require("express");
const router = express.Router();
const Series = require("../models/Series.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");
const axios = require("axios");
require('dotenv').config();

router.get("/series", isAuthenticated, async (req, res) => {
  try {
    const userId = req.payload._id;
    const series = await Series.find({ user: userId });
    res.json(series);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving series", error });
  }
});

router.get("/series/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const series = await Series.findById(id);
    
    if (!series) {
      return res.status(404).json({ message: "Serie no encontrada" });
    }

    res.json(series);
  } catch (error) {
    console.error("Error obteniendo la serie:", error);
    res.status(500).json({ message: "Error obteniendo la serie", error });
  }
});

router.post("/series/search", isAuthenticated, async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('User ID:', req.payload._id);
    console.log('TMDB API Key:', process.env.TMDB_API_KEY ? 'Exists' : 'Missing');

    const { query, tmdbId } = req.body;
    const userId = req.payload._id;

    if (!tmdbId) {
      return res.status(400).json({ 
        message: "Se requiere el ID de TMDB" 
      });
    }

    // Primero verifica si la serie ya existe
    let existingSeries = await Series.findOne({ tmdbId, user: userId });
    if (existingSeries) {
      return res.json(existingSeries);
    }

    // Si no existe, obtén los detalles directamente usando tmdbId
    try {
      const detailsResponse = await axios.get(
        `https://api.themoviedb.org/3/tv/${tmdbId}`,
        {
          params: {
            api_key: process.env.TMDB_API_KEY,
            language: "es-ES",
            append_to_response: "credits",
          },
        }
      );

      const seriesData = detailsResponse.data;
      const { credits, backdrop_path, vote_average, number_of_episodes, number_of_seasons } = seriesData;

      const newSeries = new Series({
        tmdbId,
        title: seriesData.name,
        description: seriesData.overview,
        startDate: seriesData.first_air_date ? new Date(seriesData.first_air_date) : null,
        endDate: seriesData.last_air_date ? new Date(seriesData.last_air_date) : null,
        genre: seriesData.genres.map(g => g.name),
        poster: seriesData.poster_path ? 
          `https://image.tmdb.org/t/p/w500${seriesData.poster_path}` : null,
        backdrop: backdrop_path ? 
          `https://image.tmdb.org/t/p/w1280${backdrop_path}` : null,
        rating: vote_average,
        episodes: number_of_episodes,
        seasons: number_of_seasons,
        cast: credits.cast.slice(0, 5).map((actor) => actor.name),
        user: userId,
        status: 'pending'
      });

      await newSeries.save();
      res.json(newSeries);
    } catch (tmdbError) {
      console.error("Error con la API de TMDB:", tmdbError);
      console.log(tmdbError.response?.data || "No response data available");
      return res.status(500).json({ 
        message: "Error obteniendo detalles de la serie de TMDB",
        error: tmdbError.message 
      });
    }
  } catch (error) {
    console.error("Error guardando serie:", error);
    res.status(500).json({ message: "Error interno del servidor", error: error.message });
  }
});

router.delete("/series/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedSeries = await Series.findByIdAndDelete(id);

    if (!deletedSeries) {
      return res.status(404).json({ message: "Serie no encontrada" });
    }

    res.json({ message: "Serie eliminada correctamente" });
  } catch (error) {
    console.error("Error eliminando la serie:", error);
    res.status(500).json({ message: "Error eliminando la serie", error });
  }
});

router.put("/series/:id/status", isAuthenticated, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['favorite', 'pending', 'viewed'].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const updatedSeries = await Series.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedSeries) {
      return res.status(404).json({ message: "Series not found" });
    }

    res.json(updatedSeries);
  } catch (error) {
    next(error);
  }
});

router.put("/series/:id/comment", isAuthenticated, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    const updatedSeries = await Series.findByIdAndUpdate(
      id,
      { comment },
      { new: true }
    );

    if (!updatedSeries) {
      return res.status(404).json({ message: "Series not found" });
    }

    res.json(updatedSeries);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
