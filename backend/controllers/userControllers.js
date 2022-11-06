const User = require("../models/userModel");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const sendToken = require("../utils/sendToken");
const { sendMail } = require("../utils/sendMail");
const crypto = require("crypto");

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

exports.forgotPassword = catchAsyncErrors(async(req,res,next) => {
    const user = await User.findOne({email:req.body.email});
    if(!user){
        return next(new ErrorHandler("User not found",404));
    }

    const resetToken = user.getResetPassword();
    await user.save({validateBeforeSave:false});

    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`;

    const message = `Your password reset token is \n${resetPasswordUrl} \nIf you have not requested, please ignore it.`;

    try{
        await sendMail({
            email:user.email,
            subject:"Password recovery",
            message,
        })
        res.status(200).json({
            success:true,
            message:`Mail send to ${user.email} successfully`
        })
    }catch(err){
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiry = undefined;
        await user.save({validateBeforeSave:false});
        return next(new ErrorHandler(err.message,500));
    }

})

exports.resetPassword = catchAsyncErrors(async(req,res,next) => {
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await User.findOne({resetPasswordToken,resetPasswordExpiry:{$gt:Date.now()}});
    if(!user){
        return next(new ErrorHandler("User not found",400));
    }

    if(req.body.newPassword !== req.body.confirmNewPassword){
        return next(new ErrorHandler("Password does not match",400));
    }

    user.password = req.body.newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    sendToken(user,200,res);
})