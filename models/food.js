const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    photo: {
      type: String,
      contentType: String,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: Number,
      required: true,
    },
    orderStatus: {
      type: Boolean,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Food", foodSchema);
