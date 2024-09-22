const express = require("express");
const cors = require("cors");
const app = express();
const { error } = require("./middlewares/error.js");
const helmet = require("helmet");
const dotenv = require("dotenv");

dotenv.config({ path: "./config/config.env" });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

// import routes
const userRoutes = require("./routes/userRoute.js");
const orderRoutes = require("./routes/orderRoute.js");
const transactionRoutes = require("./routes/transactionRoute.js");

//import validators
const userValidator = require("./validators/userValidator.js");
const orderValidator = require("./validators/orderValidator.js");
const transactionValidator = require("./validators/transactionValidator.js");

// use routes
app.use("/api/user", userValidator, userRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/transaction", transactionValidator, transactionRoutes);

app.get("/", (req, res) =>
  res.send(`<h1>Its working. Click to visit Link.</h1>`)
);

app.all("*", (req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

module.exports = app;
app.use(error);
