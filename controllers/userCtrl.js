require("dotenv").config();

const jwt = require("jsonwebtoken");
const exppressJwt = require("express-jwt");
const bcrypt = require("bcrypt");

const User = require("../models/user");
const Order = require("../models/order");

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
