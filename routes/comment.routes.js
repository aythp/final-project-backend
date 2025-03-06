const express = require("express");
const router = express.Router();
const Comment = require("../models/Comment.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");

router.post("/comments", isAuthenticated, async (req, res) => {
  try {
    const { content, movie, series } = req.body;
    const user = req.payload._id;

    const comment = new Comment({ content, user, movie, series });
    await comment.save();
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: "Error creating comment", error });
  }
});

router.get("/comments", isAuthenticated, async (req, res) => {
  try {
    const { movie, series } = req.query;
    const query = {};
    if (movie) query.movie = movie;
    if (series) query.series = series;

    const comments = await Comment.find(query).populate("user", "name");
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching comments", error });
  }
});

router.delete("/comments/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
  
      const deletedComment = await Comment.findByIdAndDelete(id);
  
      if (!deletedComment) {
        return res.status(404).json({ message: "Comentario no encontrado" });
      }
  
      res.json({ message: "Comentario eliminado correctamente" });
    } catch (error) {
      res.status(500).json({ message: "Error eliminando el comentario", error });
    }
  });

router.put("/comments/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { content } = req.body;
  
      const updatedComment = await Comment.findByIdAndUpdate(
        id,
        { content },
        { new: true } // Devuelve el documento actualizado
      );
  
      if (!updatedComment) {
        return res.status(404).json({ message: "Comentario no encontrado" });
      }
  
      res.json(updatedComment);
    } catch (error) {
      res.status(500).json({ message: "Error actualizando el comentario", error });
    }
  });
module.exports = router;