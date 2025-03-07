const express = require("express");
const router = express.Router();
const Movie = require("../models/Movie.model");
const Status = require("../models/Status.model");
const Comment = require("../models/Comment.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");

const axios = require("axios");

router.post("/movies/search", isAuthenticated, async (req, res) => {
    try {
      const { query } = req.body;
      const userId = req.payload._id;
  
      const response = await axios.get("https://api.themoviedb.org/3/search/movie", {
        params: {
          api_key: "4c2b98d248efaa8035b951b8303b65e7",
          query: query,
          language: "es-ES",
        },
      });
  
      const tmdbMovie = response.data.results[0];
      if (!tmdbMovie) {
        return res.status(404).json({ message: "Película no encontrada" });
      }
  
      let movie = await Movie.findOne({ tmdbId: tmdbMovie.id, user: userId });
  
      if (!movie) {
        movie = new Movie({
          tmdbId: tmdbMovie.id,
          title: tmdbMovie.title,
          description: tmdbMovie.overview,
          releaseDate: tmdbMovie.release_date,
          genre: tmdbMovie.genre_ids,
          poster: `https://image.tmdb.org/t/p/w500${tmdbMovie.poster_path}`,
          user: userId
        });
        await movie.save();
      }
  
      res.json(movie);
    } catch (error) {
      console.error("Error buscando película:", error);
      res.status(500).json({ message: "Error buscando película", error });
    }
  });

  router.delete("/movies/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const movie = await Movie.findById(id);
      if (!movie) {
        console.log("Película no encontrada");
        return res.status(404).json({ message: "Película no encontrada" });
      }
  
      const deletedStatus = await Status.deleteMany({ movie: id });
      console.log("Estados eliminados:", deletedStatus);
  
      const deletedComments = await Comment.deleteMany({ movie: id });
      console.log("Comentarios eliminados:", deletedComments);
  
      const deletedMovie = await Movie.findByIdAndDelete(id);
      console.log("Película eliminada:", deletedMovie);
  
      res.json({ message: "Película y datos relacionados eliminados correctamente" });
    } catch (error) {
      console.error("Error eliminando la película:", error);
      res.status(500).json({ message: "Error eliminando la película", error });
    }
  });

module.exports = router;