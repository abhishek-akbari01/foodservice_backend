const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
    },
    purchases: {
      type: Array,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
