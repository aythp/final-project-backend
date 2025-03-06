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

module.exports = router;