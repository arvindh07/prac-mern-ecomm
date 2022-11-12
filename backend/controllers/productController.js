const Product = require("../models/productModel");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/ApiFeatures");

// get all products
exports.getAllProducts = catchAsyncErrors(async(req,res) => {
    const resultsPerPage = 10;
    const ApiFeature = new ApiFeatures(Product.find(),req.query)
        .search()
        .filter()
        .pagination(resultsPerPage);
    const prods = await ApiFeature.query;
    res.status(200).json({
        success:true,
        prods
    })
});

// get individual product
exports.getSingleProduct = catchAsyncErrors(async(req,res,next) => {
    const prod = await Product.findById(req.params.id);
    if(!prod){
        return next(new ErrorHandler("Product not found",400)); 
    }

    res.status(200).json({
        success:true,
        prod
    })
});

// create product --- admin
exports.createProduct = catchAsyncErrors(async(req,res) => { 
    req.body.user = req.user.id;
    const newProd = req.body;
    const prod = await Product.create(newProd);

    res.status(200).json({
        success:true,
        prod
    })
});

// update product ---admin
exports.updateProduct = catchAsyncErrors(async(req,res,next) => { 
    let prod = await Product.findById(req.params.id);
    if(!prod){
        return next(new ErrorHandler("Product not found",400));
    }

    prod = await Product.findByIdAndUpdate(req.params.id,req.body,{
        runValidators:true,
        new:true,
        useFindAndModify:false
    })

    res.status(200).json({
        success:true,
        prod
    })
});

// delete product ---admin
exports.deleteProduct = catchAsyncErrors(async(req,res,next) => {
    const prod = await Product.findById(req.params.id);
    if(!prod){
        return next(new ErrorHandler("Product not found",400));
    }

    await prod.remove();
    res.status(200).json({
        success:true,
        message:"Product deleted successfully"
    })
});
