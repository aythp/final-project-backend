const express = require("express");
const router = express.Router();
const Movie = require("../models/Movie.model");
const Series = require("../models/Series.model");
const Status = require("../models/Status.model");
const Comment = require("../models/Comment.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");
const axios = require("axios");

router.get("/movies", isAuthenticated, async (req, res) => {
  try {
    const userId = req.payload._id;
    const movies = await Movie.find({ user: userId });
    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving movies", error });
  }
});

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
      const detailsResponse = await axios.get(`https://api.themoviedb.org/3/movie/${tmdbMovie.id}`, {
        params: {
          api_key: "4c2b98d248efaa8035b951b8303b65e7",
          language: "es-ES",
          append_to_response: "credits",
        },
      });

      const { credits, backdrop_path, vote_average, runtime } = detailsResponse.data;

      const genreResponse = await axios.get("https://api.themoviedb.org/3/genre/movie/list", {
        params: {
          api_key: "4c2b98d248efaa8035b951b8303b65e7",
          language: "es-ES",
        },
      });

      const genreMap = genreResponse.data.genres.reduce((map, genre) => {
        map[genre.id] = genre.name;
        return map;
      }, {});

      const genres = tmdbMovie.genre_ids.map((id) => genreMap[id]);

      movie = new Movie({
        tmdbId: tmdbMovie.id,
        title: tmdbMovie.title,
        description: tmdbMovie.overview,
        releaseDate: new Date(tmdbMovie.release_date),
        genre: genres,
        poster: `https://image.tmdb.org/t/p/w500${tmdbMovie.poster_path}`,
        backdrop: backdrop_path ? `https://image.tmdb.org/t/p/w1280${backdrop_path}` : null,
        rating: vote_average,
        runtime: runtime,
        cast: credits.cast.slice(0, 5).map((actor) => actor.name),
        director: credits.crew.find((member) => member.job === "Director")?.name || null,
        user: userId,
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


module.exports = router;
