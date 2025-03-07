const { Schema, model } = require("mongoose");

const statusSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    movie: {
      type: Schema.Types.ObjectId,
      ref: "Movie",
    },
    series: {
      type: Schema.Types.ObjectId,
      ref: "Series",
    },
    status: {
      type: String,
      enum: ["favorite", "pending", "watched"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

statusSchema.pre("validate", function (next) {
  if (!this.movie && !this.series) {
    this.invalidate("movie", "Debe proporcionar una película o una serie");
  }
  if (this.movie && this.series) {
    this.invalidate("movie", "No puede proporcionar una película y una serie al mismo tiempo");
  }
  next();
});

module.exports = model("Status", statusSchema);