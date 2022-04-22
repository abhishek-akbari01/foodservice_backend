const express = require("express");
const {
  updateProduct,
  getProductById,
  createProduct,
  deleteProduct,
} = require("../controllers/foodCtrl");
const {
  signup,
  signin,
  createOrder,
  getAllOrder,
  isAuthenticated,
  isSignedIn,
  confirmOrder,
  recentOrder,
  getAllOrderCount,
  getUserExpense,
} = require("../controllers/userCtrl");
const router = express.Router();

router.param("productId", getProductById);

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/createOrder", isSignedIn, isAuthenticated, createOrder);
router.get("/admin/getAllOrder", getAllOrder);
router.put("/admin/confirmOrder/:userId/:orderId", confirmOrder);
router.post("/admin/createProduct", createProduct);
router.put("/admin/updateProduct/:productId", updateProduct);
router.delete("/admin/deleteProduct/:productId", deleteProduct);
router.get("/recentOrder/:id", recentOrder);
router.get("/admin/getOrderCount", getAllOrderCount);
router.get("/getUserExpense/:id", getUserExpense);

module.exports = router;
