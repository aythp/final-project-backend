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

module.exports = model("Status", statusSchema);