require("dotenv").config();

const jwt = require("jsonwebtoken");
const exppressJwt = require("express-jwt");
const bcrypt = require("bcrypt");

const User = require("../models/user");

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
  return res.json({ token, msg: "signIn success", id: user._id });
};
