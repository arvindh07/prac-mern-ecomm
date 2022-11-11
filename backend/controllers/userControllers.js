const User = require("../models/userModel");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const sendToken = require("../utils/sendToken");
const { sendMail } = require("../utils/sendMail");
const crypto = require("crypto");
const Product = require("../models/productModel");

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

exports.getUserDetails = catchAsyncErrors(async(req,res,next) => {
    const user = await User.findById(req.user.id);
    if(!user){
        return next(new ErrorHandler("User not found",404));
    }
    res.status(200).json({
        success:true,
        user
    })
})

exports.changePassword = catchAsyncErrors(async(req,res,next) => {
    const user = await User.findById(req.user.id).select("+password");
    if(!user){
        return next(new ErrorHandler("User not found",404));
    }
    const isPasswordMatch = await user.comparePassword(req.body.oldPassword);
    if(!isPasswordMatch){
        return next(new ErrorHandler("Old password is incorrect",400));
    }

    if(req.body.newPassword !== req.body.confirmNewPassword){
        return next(new ErrorHandler("Password does not match",400));
    }
    user.password = req.body.newPassword;
    await user.save();
    res.status(200).json({
        success:true,
        message:"Password changed successfully"
    })
})

exports.updateProfile = catchAsyncErrors(async(req,res,next) => {
    const newUserData = {
        name:req.body.name,
        email:req.body.email
    };
    const user = await User.findByIdAndUpdate(req.user.id,newUserData,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    });
    res.status(200).json({
        succes:true,
        user
    })
})

exports.getAllUsers = catchAsyncErrors(async(req,res,next) => {
    const users = await User.find();
    res.status(200).json({
        success:true,
        users
    })
})

exports.getSingleUser = catchAsyncErrors(async(req,res,next) => {
    const user = await User.findById(req.params.id);
    if(!user){
        return next(new ErrorHandler("User not found",400));
    }
    res.status(200).json({
        succes:true,
        user
    })
})

exports.updateUserRole = catchAsyncErrors(async(req,res,next) => {
    const newUserData = {
        name:req.body.name,
        email:req.body.email,
        role:req.body.role
    };
    let user = await User.findById(req.params.id);
    if(!user){
        return next(new ErrorHandler("User not found",400));
    }
    user = await User.findByIdAndUpdate(req.params.id,newUserData,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    });
    await user.save();
    res.status(200).json({
        succes:true,
        user
    })
})

exports.deleteUser = catchAsyncErrors(async(req,res,next) => {
    const user = await User.findById(req.params.id);
    if(!user){
        return next(new ErrorHandler("User not found",400));
    }

    await user.remove();
    res.status(200).json({
        success:true,
        message:"User deleted successfully"
    })
})

exports.createReview = catchAsyncErrors(async(req,res,next) => {
    const {productId,rating,comment} = req.body;
    const review = {
        user:req.user._id,
        name:req.user.name,
        comment:comment,
        rating:Number(rating)
    }

    const prod = await Product.findById(productId);
    if(!prod){
        return next(new ErrorHandler("Product not found",400));
    }
    const isReviewed = prod.reviews.find((rev) => rev.user.toString() === req.user._id.toString());
    if(isReviewed){
        prod.reviews.forEach(rev => {
            if(rev.user.toString() === req.user._id.toString()){
                rev.rating = rating;
                rev.comment = comment;
                rev.name = req.user.name
            }
        });
    }else{
        prod.reviews.push(review);
        prod.numberOfReviews = prod.reviews.length;
    }

    let sum = 0;
    prod.reviews.forEach(rev => sum += rev.rating);
    prod.ratings = sum/prod.reviews.length;

    await prod.save();
    res.status(200).json({
        success:true,
        prod
    })
})

exports.getProductReviews = catchAsyncErrors(async(req,res,next) => {
    const prod = await Product.findById(req.query.id);
    if(!prod){
        return next(new ErrorHandler("Product not found",400));
    }

    res.status(200).json({
        success:true,
        message: prod.reviews
    })
})

exports.deleteReview = catchAsyncErrors(async(req,res,next) => {
    const prod = await Product.findById(req.query.productId);
    if(!prod){
        return next(new ErrorHandler("Product not found",400));
    }

    const reviews = prod.reviews.filter(rev => rev._id.toString() !== req.query.id.toString());
    let sum = 0;
    prod.reviews.forEach(rev => sum += rev.rating);
    const ratings = sum/prod.reviews.length;
    const numberOfReviews = prod.reviews.length;
    await Product.findByIdAndUpdate(req.query.productId,
        {reviews,ratings,numberOfReviews},
        {
            new:true,
            runValidators:true,
            useFindAndModify:false
        })

    res.status(200).json({
        success:true,
        message:"review deleted successfully"
    })
})