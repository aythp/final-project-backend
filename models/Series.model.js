const { Schema, model } = require("mongoose");

const seriesSchema = new Schema(
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
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      default: null,
    },
    genre: {
      type: [String],
      required: true,
    },
    poster: {
      type: String,
      required: true,
    },
    backdrop: {
      type: String,
      default: null,
    },
    rating: {
      type: Number,
      default: 0,
    },
    episodes: {
      type: Number,
      default: 0,
    },
    seasons: {
      type: Number,
      default: 0,
    },
    cast: {
      type: [String],
      default: [],
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

seriesSchema.index({ tmdbId: 1, user: 1 }, { unique: true });

module.exports = model("Series", seriesSchema);