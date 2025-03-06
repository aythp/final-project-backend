const { Schema, model } = require("mongoose");

const commentSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
    },
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
  },
  {
    timestamps: true,
  }
);

module.exports = model("Comment", commentSchema);