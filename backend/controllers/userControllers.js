const User = require("../models/userModel");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const sendToken = require("../utils/sendToken");

exports.registerUser = catchAsyncErrors(async(req,res,next) => {
    const {name,email,password} = req.body;
    const user = await User.create({
        name,
        email,
        password,
        avatar:{
            public_id:"sam_id",
            url:"sam_url"
        }
    });

    sendToken(user,201,res);
});

exports.loginUser = catchAsyncErrors(async(req,res,next) => {
    const {email,password} = req.body;

    if(!email || !password){
        return next(new ErrorHandler("Please enter email and password",400));
    }
    const user = await User.findOne({email}).select("+password");
    if(!user){
        return next(new ErrorHandler("Invalid email or password",400));
    }

    const passwordMatch = await user.comparePassword(password);
    if(!passwordMatch){
        return next(new ErrorHandler("Invalid email or password",400));
    }

    sendToken(user,200,res);
})

exports.logoutUser = catchAsyncErrors((req,res,next) => {
    res.cookie("token",null,{
        expires:new Date(Date.now()),
        httpOnly:true
    });
    res.json({
        success:true,
        message:"Logged out successfully"
    })
})