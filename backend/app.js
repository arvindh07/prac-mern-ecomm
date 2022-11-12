const express = require("express");
const app = express();
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const orderRoutes = require("./routes/orderRoutes");
const errorMiddleware = require("./middleware/error");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

// app use
app.use(express.json());
app.use(cookieParser());

// routes
app.use("/api/v1",productRoutes);
app.use("/api/v1",userRoutes);
app.use("/api/v1",orderRoutes);

// **************use error middleware at last *******************
app.use(errorMiddleware);
app.use(bodyParser.urlencoded({extended:false}));

module.exports = app;