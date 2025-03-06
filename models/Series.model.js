const { Schema, model } = require("mongoose");

const seriesSchema = new Schema(
  {
    tmdbId: {
      type: Number,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
    },
    genre: {
      type: [String],
      required: true,
    },
    poster: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model("Series", seriesSchema);