const express = require("express");
const router = express.Router();
const Status = require("../models/Status.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");

router.post("/status", isAuthenticated, async (req, res) => {
  try {
    const { movie, series, status } = req.body;
    const user = req.payload._id;

    if (movie && series) {
      return res.status(400).json({ message: "No puede proporcionar una película y una serie al mismo tiempo" });
    }
    if (!movie && !series) {
      return res.status(400).json({ message: "Debe proporcionar una película o una serie" });
    }

    const existingStatus = await Status.findOne({ user, movie, series });

    if (existingStatus) {
      existingStatus.status = status;
      await existingStatus.save();
      return res.json(existingStatus);
    }

    const newStatus = new Status({ user, movie, series, status });
    await newStatus.save();
    res.status(201).json(newStatus);
  } catch (error) {
    res.status(500).json({ message: "Error definiendo el estado", error });
  }
});

router.get("/status", isAuthenticated, async (req, res) => {
  try {
    const user = req.payload._id;
    const { movie, series } = req.query;

    if (movie && series) {
      return res.status(400).json({ message: "No puede proporcionar una película y una serie al mismo tiempo" });
    }
    if (!movie && !series) {
      return res.status(400).json({ message: "Debe proporcionar una película o una serie" });
    }

    const status = await Status.findOne({ user, movie, series });

    if (!status) {
      return res.status(404).json({ message: "Estado no encontrado" });
    }

    res.json(status);
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo el estado", error });
  }
});

router.get("/status/all", isAuthenticated, async (req, res) => {
  try {
    const user = req.payload._id;
    const statuses = await Status.find({ user }).populate("movie series");
    res.json(statuses);
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo los estados", error });
  }
});

router.put("/status/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedStatus = await Status.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedStatus) {
      return res.status(404).json({ message: "Estado no encontrado" });
    }

    res.json(updatedStatus);
  } catch (error) {
    res.status(500).json({ message: "Error actualizando el estado", error });
  }
});

router.delete("/status/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedStatus = await Status.findByIdAndDelete(id);

    if (!deletedStatus) {
      return res.status(404).json({ message: "Estado no encontrado" });
    }

    res.json({ message: "Estado eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error eliminando el estado", error });
  }
});

module.exports = router;