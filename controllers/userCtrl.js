require("dotenv").config();

const jwt = require("jsonwebtoken");
const exppressJwt = require("express-jwt");
const bcrypt = require("bcrypt");

const User = require("../models/user");
const Order = require("../models/order");

const mongoose = require("mongoose");
const res = require("express/lib/response");

exports.getUserById = (req, res, next, id) => {
  User.findById(id).exec((err, user) => {
    if (err || !user) {
      console.log(err);
      return res.status(400).json({
        err: "No user was found in DB",
      });
    }
    req.profile = user;
    next();
  });
};

exports.signup = async (req, res) => {
  const { username, password, role } = req.body;

  const userDB = await User.findOne({ username });
  if (userDB)
    return res.status(400).json({ err: "The username already exists." });

  const passwordHash = await bcrypt.hash(password, 10);

  const user = new User({
    username: username,
    password: passwordHash,
    role: role,
  });

  user.save((err, user) => {
    if (err) {
      //   console.log("Error - ", err);
      return res.status(400).json({
        err: "Not able to save user",
      });
    }
    res.json({
      msg: "user signup successfully",
    });
  });
};

exports.signin = async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ err: "user does not exists" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ err: "Incorrect password" });

  //create token
  const token = jwt.sign({ _id: user._id }, process.env.ACCESS_TOKEN_SECRET);

  //send response to front end
  return res.json({
    token,
    msg: "signIn success",
    id: user._id,
    username: user.username,
    role: user.role,
  });
};

exports.isSignedIn = exppressJwt({
  secret: process.env.ACCESS_TOKEN_SECRET,
  userProperty: "auth",
  algorithms: ["HS256"],
});

//custom-middleware
exports.isAuthenticated = (req, res, next) => {
  let checker = req.profile && req.auth && req.profile._id == req.auth._id;

  if (!checker) {
    return res.status(403).json({
      err: "ACCESS DENIED",
    });
  }

  next();
};

exports.createOrder = (req, res) => {
  const userId = req.params.userId;

  const data = new Order({
    userId: userId,
    purchases: purchases,
  });
  data.save((err, result) => {
    if (err) {
      console.log(err);
      return;
    }
    console.log("order add result - ", result);
    res.json({ result });
  });
};

exports.getAllOrder = (req, res) => {
  User.find({}, { order: 1, username: 1 }, (err, users) => {
    if (err) return res.status(400).json({ err: "Something went wrong" });
    // console.log("users type", users[0]);
    // const newusers = users.map((v) => {
    // console.log(
    //   v.order.filter((o) => {
    //     // console.log(o.orderStatus);
    //     return o.orderStatus == false;
    //   })
    // );
    // console.log(
    //   "v.order.filter((o) => o.orderStatus)",
    //   v.order.filter((o) => o.orderStatus == true)
    // );
    //   return {
    //     ...v,
    //     order: v.order.filter((o) => {
    //       o.orderStatus == false;
    //     }),
    //   };
    // });
    // console.log("newusers", newusers);
    res.json(users);
  });
};

exports.confirmOrder = (req, res) => {
  const userId = req.params.userId;
  const orderId = req.params.orderId;

  User.updateOne(
    { _id: userId, "order._id": orderId },
    {
      $set: {
        "order.$.orderStatus": true,
      },
    },
    {
      new: true,
    }
  ).exec((err, user) => {
    if (err) return res.status(400).json({ err: "Something went wrong" });
    res.json(user);
  });
};

exports.recentOrder = (req, res) => {
  const userId = req.params.id;
  console.log(userId);

  User.aggregate([
    { $match: { _id: mongoose.Types.ObjectId(userId) } },
    { $unwind: { path: "$order" } },
    { $sort: { "order.createdAt": -1 } },
    { $limit: 3 },
    {
      $group: {
        _id: "$_id",
        data: {
          $push: {
            item: "$order.item",
            date: "$order.createdAt",
            title: "$order.title",
            description: "$order.description",
            photo: "$order.photo",
            price: "$order.price",
          },
        },
      },
    },
  ]).exec((err, list) => {
    if (err) return res.status(400).json({ err: "Something went wrong" });
    res.json({ list });
  });

  // User.find(
  //   { _id: userId },
  //   { order: 1 },
  //   { $orderby: { "order.$.createdAt": -1 } }
  // ).exec((err, list) => {
  //   if (err) return res.status(400).json({ err: "Something went wrong" });
  //   res.json(list);
  // });
};

exports.getAllOrderCount = async (req, res) => {
  let orderCount = 0;
  let totalMoney = 0;
  User.find({}, { order: 1 }).exec((err, users) => {
    if (err) return res.status(400).json({ err: "Somthing went wrong" });
    users.map((user) => {
      user.order.map((ord) => {
        orderCount = orderCount + 1;
        totalMoney = totalMoney + ord.price;
      });
    });
    res.json({ orderCount, totalMoney });
  });
};

exports.getUserExpense = async (req, res) => {
  const userId = req.params.id;
  let orderCount = 0;
  let totalMoney = 0;
  User.find({ _id: userId }, { order: 1 }).exec((err, user) => {
    if (err) return res.status(400).json({ err: "Somthing went wrong" });

    // console.log({ user });
    user[0].order.map((ord) => {
      orderCount = orderCount + 1;
      totalMoney = totalMoney + ord.price;
    });

    res.json({ orderCount, totalMoney });
  });
};
