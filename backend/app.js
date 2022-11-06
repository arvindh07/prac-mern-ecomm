const express = require("express");
const app = express();
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const errorMiddleware = require("./middleware/error");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

// app use
app.use(express.json());
app.use(cookieParser());

// routes
app.use("/api/v1",productRoutes);
app.use("/api/v1",userRoutes);
app.use("/api/v1",authRoutes);

// **************use error middleware at last *******************
app.use(errorMiddleware);
app.use(bodyParser.urlencoded({extended:false}));

module.exports = app;