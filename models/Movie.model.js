const { Schema, model } = require("mongoose");

const movieSchema = new Schema(
  {
    tmdbId: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "Sin descripción disponible",
    },
    releaseDate: {
      type: Date,
      default: null,
    },
    genre: {
      type: [String],
      default: [],
    },
    poster: {
      type: String,
      default: null,
    },
    backdrop: {
      type: String,
      default: null, 
    },
    rating: {
      type: Number,
      default: 0, 
    },
    runtime: {
      type: Number,
      default: 0, 
    },
    cast: {
      type: [String],
      default: [],
    },
    director: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['favorite', 'pending', 'viewed'],
      default: 'pending'
    },
    comment: {
      type: String,
      default: ''
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

movieSchema.index({ tmdbId: 1, user: 1 }, { unique: true });

module.exports = model("Movie", movieSchema);