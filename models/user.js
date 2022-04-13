const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: Number,
      default: 0,
    },
    addCart: {
      type: Array,
    },
    order: {
      type: Array,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
