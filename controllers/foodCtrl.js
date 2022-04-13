const multer = require("multer");
const mongoose = require("mongoose");
const Food = require("../models/food");
const User = require("../models/user");
const formidable = require("formidable");
const fs = require("fs");
const path = require("path");
const mv = require("mv");
const _ = require("lodash");

const Order = require("../models/order");

const upload = multer({
  dest: "uploads/products/",
});

exports.getProductById = (req, res, next, id) => {
  Food.findById(id).exec((err, product) => {
    if (err) {
      return res.status(400).json({
        err: "Product not found",
      });
    }
    req.product = product;
    next();
  });
};

exports.createProduct = (req, res) => {
  //   const { title, description, image, category } = req.body;
  console.log(req);

  let form = new formidable.IncomingForm();
  form.keepExtension = true;
  form.parse(req, (err, fields, file) => {
    if (err) {
      console.log("err - ", err);
      return res.status(400).json({
        err: "problem with image",
      });
    }

    console.log("fields - ", fields);
    console.log("file - ", file);
    console.log("req - ", req.body);

    const { title, description, category, price } = fields;

    if (file.photo) {
      console.log("photo - ", file.photo.originalFilename);

      upload.single("photo");

      const tempPath = file.photo.filepath;
      console.log("temp path - ", tempPath);
      const targetPath = path.join(
        __dirname,
        `../uploads/products/${file.photo.originalFilename}`
      );

      if (
        path.extname(file.photo.originalFilename).toLowerCase() === ".png" ||
        path.extname(file.photo.originalFilename).toLowerCase() === ".jpeg" ||
        path.extname(file.photo.originalFilename).toLowerCase() === ".jpg"
      ) {
        // console.log("khsdusvd");
        mv(tempPath, targetPath, (err) => {
          if (err) {
            console.log("Error - ", err);
            return;
          } else {
            console.log("File uploaded");
          }
        });
      } else {
        fs.unlink(tempPath, (err) => {
          if (err) {
            res.status(403).json({ err: "Only .png files are allowed" });
          }
        });
      }

      // product.photo.data = fs.readFileSync(file.photo.path);
      // console.log("photo data - ",product.photo.data);
      // product.photo.contentType = file.photo.type;
      // console.log("photo content - ",product.photo.contentType);
    }

    let product = new Food({
      title: title,
      description: description,
      photo: `products/${file.photo.originalFilename}`,
      category: category,
      price: price,
    });

    product.save((err, product) => {
      if (err) {
        res.status(400).json({
          err: "Product not saved in database",
        });
      }
      res.json({
        msg: "Product add successfully",
      });
    });
  });
};

exports.updateProduct = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtension = true;
  form.parse(req, (err, fields, file) => {
    if (err) {
      console.log("err - ", err);
      return res.status(400).json({
        err: "problem with image",
      });
    }

    console.log("fields - ", fields);
    // console.log("file - ", file);
    // console.log("req - ", req.body);

    let product = req.product;
    console.log(product);

    // const { title, description, category, price } = fields;

    if (file.photo) {
      console.log("photo - ", file.photo.originalFilename);

      upload.single("photo");

      const tempPath = file.photo.filepath;
      console.log("temp path - ", tempPath);
      const targetPath = path.join(
        __dirname,
        `../uploads/products/${file.photo.originalFilename}`
      );

      if (
        path.extname(file.photo.originalFilename).toLowerCase() === ".png" ||
        path.extname(file.photo.originalFilename).toLowerCase() === ".jpeg" ||
        path.extname(file.photo.originalFilename).toLowerCase() === ".jpg"
      ) {
        // console.log("khsdusvd");
        mv(tempPath, targetPath, (err) => {
          if (err) {
            console.log("Error - ", err);
            return;
          } else {
            console.log("File uploaded");
          }
        });
      } else {
        fs.unlink(tempPath, (err) => {
          if (err) {
            res.status(403).json({ err: "Only .png files are allowed" });
          }
        });
      }
      product = _.extend(product, fields, {
        photo: `products/${file.photo.originalFilename}`,
      });
    } else {
      product = _.extend(product, fields);
    }

    product.save((err, product) => {
      if (err) {
        res.status(400).json({
          err: "Product not update in database",
        });
      }
      res.json({
        msg: "Product updates successfully",
      });
    });
  });
};

exports.deleteProduct = (req, res) => {
  const productId = req.params.productId;

  Food.findByIdAndDelete({ _id: productId }).exec((err, foods) => {
    if (err)
      return res.status(400).json({
        err: "Food list not found in DB",
      });
    res.json(foods);
  });
};

exports.getAllProduct = (req, res) => {
  Food.find({}).exec((err, foods) => {
    if (err)
      return res.status(400).json({
        err: "Food list not found in DB",
      });
    res.json(foods);
  });
};

exports.getCategoryWiseProduct = (req, res) => {
  const category = req.params.category;
  Food.find({ category: category }).exec((err, foods) => {
    if (err)
      return res.status(400).json({
        err: "Food list by category not found in DB",
      });
    res.json(foods);
  });
};

exports.addToCart = async (req, res) => {
  const userId = req.params.userId;
  const itemId = req.params.itemId;

  // let item = {};

  const item = await Food.findOne({ _id: itemId });
  // const data = await item.json();

  // .exec((err, item) => {
  //   if (err)
  //     return res
  //       .status(400)
  //       .json({ err: "something went wrong in add to cart" });
  //   console.log(item);

  //   // res.json(item);
  // });

  console.log("item - ", item);

  User.findByIdAndUpdate(
    { _id: userId },
    { $push: { addCart: item } },
    { new: true },
    (err, user) => {
      if (err)
        return res
          .status(400)
          .json({ err: "something went wrong in add to cart" });
      res.json(user);
    }
  );
};

exports.getCartItem = (req, res) => {
  const userId = req.params.userId;

  User.find({ _id: userId }, { addCart: 1, _id: 0 }).exec((err, user) => {
    if (err) return res.status(400).json({ err: "Some went wrong" });
    res.json(user);
  });
};

exports.clearCart = (userId) => (req, res) => {
  // const userId = req.params.userId;
  console.log("cart called - ", userId);

  User.findByIdAndUpdate(
    { _id: userId },
    { $set: { addCart: [] } },
    { new: true },
    (err, user) => {
      if (err)
        return res
          .status(400)
          .json({ err: "something went wrong in add to cart" });
      res.json(user);
    }
  );
};

exports.addOrders = (req, res) => {
  const userId = req.params.userId;
  const data = req.body;

  User.findByIdAndUpdate(
    { _id: userId },
    {
      $push: { order: { $each: data } },
      $set: { addCart: [] },
    },
    { new: true },
    (err, user) => {
      if (err)
        return res
          .status(400)
          .json({ err: "something went wrong in add to cart" });
      res.json(user);
    }
  );
};
