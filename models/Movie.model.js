const { Schema, model } = require("mongoose");

const movieSchema = new Schema(
  {
    tmdbId: {
      type: Number,
      required: true
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    releaseDate: {
      type: Date,
      required: true,
    },
    genre: {
      type: [String],
      required: true,
    },
    poster: {
      type: String,
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }
  },
  {
    timestamps: true,
  }
);

movieSchema.index({ tmdbId: 1, user: 1 });

module.exports = model("Movie", movieSchema);