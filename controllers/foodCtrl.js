const multer = require("multer");
const mongoose = require("mongoose");
const Food = require("../models/food");
const formidable = require("formidable");
const fs = require("fs");
const path = require("path");
const mv = require("mv");

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
  //   console.log(req);

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

    const { title, description, category } = fields;

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
