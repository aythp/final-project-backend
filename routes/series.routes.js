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

    // Crear una serie con datos mínimos primero para garantizar que se guarde
    const minimalSeries = new Series({
      tmdbId,
      title: query || `Serie ID: ${tmdbId}`,
      user: userId,
      status: 'pending'
    });
    
    // Guardar la serie con datos mínimos
    await minimalSeries.save();
    
    // Intentar enriquecer con datos de TMDB, pero no bloquear si falla
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
      
      // Actualizar la serie con los datos completos
      if (seriesData) {
        // Extract data safely with fallbacks
        const updates = {
          title: seriesData.name || minimalSeries.title,
          description: seriesData.overview || minimalSeries.description,
          startDate: seriesData.first_air_date ? new Date(seriesData.first_air_date) : null,
          endDate: seriesData.last_air_date ? new Date(seriesData.last_air_date) : null,
          poster: seriesData.poster_path ? `https://image.tmdb.org/t/p/w500${seriesData.poster_path}` : null,
          backdrop: seriesData.backdrop_path ? `https://image.tmdb.org/t/p/w1280${seriesData.backdrop_path}` : null,
          rating: typeof seriesData.vote_average === 'number' ? seriesData.vote_average : 0,
          episodes: typeof seriesData.number_of_episodes === 'number' ? seriesData.number_of_episodes : 0,
          seasons: typeof seriesData.number_of_seasons === 'number' ? seriesData.number_of_seasons : 0,
        };
        
        // Actualizar géneros si están disponibles
        if (seriesData.genres && Array.isArray(seriesData.genres)) {
          updates.genre = seriesData.genres.map(g => g.name);
        }
        
        // Actualizar reparto si está disponible
        if (seriesData.credits && seriesData.credits.cast && Array.isArray(seriesData.credits.cast)) {
          updates.cast = seriesData.credits.cast.slice(0, 5).map(actor => actor.name || "Actor desconocido");
        }
        
        // Actualizar la serie en la base de datos
        const updatedSeries = await Series.findByIdAndUpdate(
          minimalSeries._id,
          updates,
          { new: true }
        );
        
        return res.json(updatedSeries);
      }
    } catch (tmdbError) {
      console.error("Error con la API de TMDB:", tmdbError);
      // No devolvemos error, simplemente continuamos con la serie mínima
    }
    
    // Si no se pudo enriquecer con TMDB, devolver la serie mínima
    return res.json(minimalSeries);
    
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
