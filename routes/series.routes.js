const express = require("express");
const router = express.Router();
const Series = require("../models/Series.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");
const axios = require("axios");

router.post("/series/search", isAuthenticated, async (req, res) => {
  try {
    const { query } = req.body;

    const response = await axios.get("https://api.themoviedb.org/3/search/tv", {
      params: {
        api_key: "4c2b98d248efaa8035b951b8303b65e7",
        query: query,
        language: "es-ES",
      },
    });

    const tmdbSeries = response.data.results[0];
    if (!tmdbSeries) {
      return res.status(404).json({ message: "Series not found" });
    }

    let series = await Series.findOne({ tmdbId: tmdbSeries.id });
    if (!series) {

      series = new Series({
        tmdbId: tmdbSeries.id,
        title: tmdbSeries.name,
        description: tmdbSeries.overview,
        startDate: tmdbSeries.first_air_date,
        endDate: tmdbSeries.last_air_date,
        genre: tmdbSeries.genre_ids,
      });
      await series.save();
    }

    res.json(series);
  } catch (error) {
    res.status(500).json({ message: "Error searching for series", error });
  }
});

module.exports = router;