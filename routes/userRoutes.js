const express = require("express");
const {
  signup,
  signin,
  createOrder,
  getAllOrder,
  isAuthenticated,
  isSignedIn,
} = require("../controllers/userCtrl");
const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/createOrder", isSignedIn, isAuthenticated, createOrder);
router.post("/admin/getAllOrder", isSignedIn, isAuthenticated, getAllOrder);

module.exports = router;
