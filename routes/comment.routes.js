const express = require("express");
const router = express.Router();
const Comment = require("../models/Comment.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");

router.post("/comments", isAuthenticated, async (req, res) => {
    try {
      const { content, movie, series, post } = req.body;
      const user = req.payload._id;
  
      if ([movie, series, post].filter(Boolean).length !== 1) {
        return res.status(400).json({ message: "Debe proporcionar una película, serie o post" });
      }
  
      const newComment = new Comment({ user, content, movie, series, post });
      await newComment.save();
      res.status(201).json(newComment);
    } catch (error) {
      res.status(500).json({ message: "Error creando el comentario", error });
    }
  });
  
  router.get("/comments", isAuthenticated, async (req, res) => {
    try {
      const { movie, series, post } = req.query;
  
      if ([movie, series, post].filter(Boolean).length !== 1) {
        return res.status(400).json({ message: "Debe proporcionar una película, serie o post" });
      }
  
      const comments = await Comment.find({ movie, series, post }).populate("user", "name");
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: "Error obteniendo los comentarios", error });
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