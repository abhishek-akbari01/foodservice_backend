const express = require("express");
const {
  createProduct,
  getAllProduct,
  getCategoryWiseProduct,
  addToCart,
  clearCart,
  getCartItem,
  addOrders,
} = require("../controllers/foodCtrl");
const router = express.Router();

router.get("/getAllProduct", getAllProduct);
router.get("/getCatProduct/:category", getCategoryWiseProduct);
router.put("/addToCart/:userId/:itemId", addToCart);
router.put("/clearCart/:userId", clearCart);
router.get("/getCartItems/:userId", getCartItem);
router.put("/placeOrder/:userId", addOrders);

module.exports = router;
