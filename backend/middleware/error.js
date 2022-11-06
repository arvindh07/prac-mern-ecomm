const ErrorHandler = require("../utils/ErrorHandler");

module.exports = (err,req,res,next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal server error";

    if(err.name === "CastError"){
        const msg = `Resource not found. Invalid: ${err.path}`;
        err = new ErrorHandler(msg,400);
    }

    if(err.code === 11000){
        const msg = `Email already exists. Please try with new email`;
        err = new ErrorHandler(msg,400);
    }

    if(err.name === "JsonWebTokenError"){
        const msg = `Json web token is invalid. Try again`;
        err = new ErrorHandler(msg,400);
    }

    if(err.name === "TokenExpiredError"){
        const msg = `Json web token is expired. Try again`;
        err = new ErrorHandler(msg,400);
    }

    res.status(err.statusCode).json({
        success:false,
        message:err.message
    })
}