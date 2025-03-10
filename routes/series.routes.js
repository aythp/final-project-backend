const express = require("express");
const router = express.Router();
const Series = require("../models/Series.model");
const Status = require("../models/Status.model");
const Comment = require("../models/Comment.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");
const axios = require("axios");

router.get("/series", isAuthenticated, async (req, res) => {
  try {
    const userId = req.payload._id;
    const series = await Series.find({ user: userId });
    res.json(series);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving series", error });
  }
});

router.post("/series/search", isAuthenticated, async (req, res) => {
  try {
    const { query } = req.body;
    const userId = req.payload._id;

    const searchResponse = await axios.get("https://api.themoviedb.org/3/search/tv", {
      params: {
        api_key: "4c2b98d248efaa8035b951b8303b65e7",
        query: query,
        language: "es-ES",
      },
    });

    const tmdbSeries = searchResponse.data.results[0];
    if (!tmdbSeries) {
      return res.status(404).json({ message: "Serie no encontrada" });
    }

    let series = await Series.findOne({ tmdbId: tmdbSeries.id, user: userId });

    if (!series) {
      const detailsResponse = await axios.get(`https://api.themoviedb.org/3/tv/${tmdbSeries.id}`, {
        params: {
          api_key: "4c2b98d248efaa8035b951b8303b65e7",
          language: "es-ES",
          append_to_response: "credits",
        },
      });

      const { credits, backdrop_path, vote_average, number_of_episodes, number_of_seasons } = detailsResponse.data;

      const genreResponse = await axios.get("https://api.themoviedb.org/3/genre/tv/list", {
        params: {
          api_key: "4c2b98d248efaa8035b951b8303b65e7",
          language: "es-ES",
        },
      });

      const genreMap = genreResponse.data.genres.reduce((map, genre) => {
        map[genre.id] = genre.name;
        return map;
      }, {});

      const genres = tmdbSeries.genre_ids.map((id) => genreMap[id]);

      series = new Series({
        tmdbId: tmdbSeries.id,
        title: tmdbSeries.name,
        description: tmdbSeries.overview,
        startDate: new Date(tmdbSeries.first_air_date),
        endDate: tmdbSeries.last_air_date ? new Date(tmdbSeries.last_air_date) : null,
        genre: genres,
        poster: `https://image.tmdb.org/t/p/w500${tmdbSeries.poster_path}`,
        backdrop: backdrop_path ? `https://image.tmdb.org/t/p/w1280${backdrop_path}` : null,
        rating: vote_average,
        episodes: number_of_episodes,
        seasons: number_of_seasons,
        cast: credits.cast.slice(0, 5).map((actor) => actor.name),
        user: userId,
      });

      await series.save();
    }

    res.json(series);
  } catch (error) {
    console.error("Error buscando serie:", error);
    res.status(500).json({ message: "Error buscando serie", error });
  }
});

router.delete("/series/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedSeries = await Series.findByIdAndDelete(id);

    if (!deletedSeries) {
      return res.status(404).json({ message: "Serie no encontrada" });
    }

    await Status.deleteMany({ series: id });

    await Comment.deleteMany({ series: id });

    res.json({ message: "Serie y datos relacionados eliminados correctamente" });
  } catch (error) {
    console.error("Error eliminando la serie:", error);
    res.status(500).json({ message: "Error eliminando la serie", error });
  }
});

module.exports = router;
