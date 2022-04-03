require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const dbUrl = process.env.MONGODB_URL;
const bodyParser = require("body-parser");
const cors = require("cors");

const userRoutes = require("./routes/userRoutes");

const app = express();
const port = process.env.PORT || 3001;

// mongodb connection
mongoose
  .connect(
    dbUrl,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
    // (err) => {
    //   if (err) throw err;
    //   console.log("Connected to mongodb");
    // }
  )
  .then((model) => {
    // console.log("model - ", model.connections[0].db);
    console.log("Connected to mongodb");
  })
  .catch((err) => {
    console.log(err);
    console.log("Database not Connected");
  });

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello world");
});

app.use("/api", userRoutes);

app.listen(port, () => {
  console.log("App is running!!");
});
