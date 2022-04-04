const express = require("express");
const { createProduct } = require("../controllers/foodCtrl");
const router = express.Router();

router.post("/createProduct", createProduct);

module.exports = router;
