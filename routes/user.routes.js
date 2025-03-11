const express = require("express");
const router = express.Router();
const User = require("../models/User.model");
const Movie = require("../models/Movie.model");
const Series = require("../models/Series.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");

router.get("/users/search/:query", isAuthenticated, async (req, res) => {
  try {
    const { query } = req.params;
    const users = await User.find({
      name: { $regex: query, $options: "i" }
    }).select("name");
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error buscando usuarios", error });
  }
});

router.get("/users/feed", isAuthenticated, async (req, res) => {
  try {
    const currentUser = await User.findById(req.payload._id);
    
    const feed = await Promise.all([
      Movie.find({ 
        user: { $in: currentUser.following },
        $or: [
          { comment: { $ne: "" } },
          { status: { $in: ["favorite", "viewed"] } }
        ]
      })
        .populate("user", "name")
        .sort({ updatedAt: -1 }),
      
      Series.find({ 
        user: { $in: currentUser.following },
        $or: [
          { comment: { $ne: "" } },
          { status: { $in: ["favorite", "viewed"] } }
        ]
      })
        .populate("user", "name")
        .sort({ updatedAt: -1 })
    ]);

    const [movies, series] = feed;
    const combinedFeed = [...movies, ...series]
      .sort((a, b) => b.updatedAt - a.updatedAt);

    res.json(combinedFeed);
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo el feed", error });
  }
});


router.post("/users/follow/:userId", isAuthenticated, async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.userId);
    const currentUser = await User.findById(req.payload._id);

    if (!userToFollow || !currentUser) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    if (req.params.userId === req.payload._id) {
      return res.status(400).json({ message: "No puedes seguirte a ti mismo" });
    }

    if (currentUser.following.includes(req.params.userId)) {
      return res.status(400).json({ message: "Ya sigues a este usuario" });
    }

    await User.findByIdAndUpdate(
      req.payload._id,
      { $push: { following: req.params.userId } }
    );

    await User.findByIdAndUpdate(
      req.params.userId,
      { $push: { followers: req.payload._id } }
    );

    res.json({ message: "Usuario seguido exitosamente" });
  } catch (error) {
    res.status(500).json({ message: "Error siguiendo al usuario", error });
  }
});

router.post("/users/unfollow/:userId", isAuthenticated, async (req, res) => {
  try {
    const userToUnfollow = await User.findById(req.params.userId);
    const currentUser = await User.findById(req.payload._id);

    if (!userToUnfollow || !currentUser) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    if (!currentUser.following.includes(req.params.userId)) {
      return res.status(400).json({ message: "No sigues a este usuario" });
    }

    await User.findByIdAndUpdate(
      req.payload._id,
      { $pull: { following: req.params.userId } }
    );

    await User.findByIdAndUpdate(
      req.params.userId,
      { $pull: { followers: req.payload._id } }
    );

    res.json({ message: "Usuario dejado de seguir exitosamente" });
  } catch (error) {
    res.status(500).json({ message: "Error dejando de seguir al usuario", error });
  }
});

router.get("/users/:userId", isAuthenticated, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId)
      .select("-password") // Excluimos la contraseña
      .populate("followers", "name")
      .populate("following", "name");

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const movies = await Movie.find({ user: userId });
    const series = await Series.find({ user: userId });

    const userProfile = {
      ...user.toObject(),
      movies,
      series
    };

    res.json(userProfile);
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo perfil de usuario", error });
  }
});

module.exports = router; 