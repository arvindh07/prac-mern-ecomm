const Order = require("../models/orderModel");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");
const Product = require("../models/productModel");

exports.newOrder = catchAsyncErrors(async(req,res,next) => {
    req.body.user = req.user._id;
    req.body.paidAt = Date.now();
    const newOrder = req.body;
    const order = await Order.create(newOrder);

    res.status(201).json({
        success:true,
        order
    })
})

exports.getSingleOrder = catchAsyncErrors(async(req,res,next) => {
    const order = await Order.findById(req.params.id).populate("user","name email");
    if(!order){
        return next(new ErrorHandler("Order not found",400));
    }

    res.status(200).json({
        success:true,
        order
    })
})

exports.myOrders = catchAsyncErrors(async(req,res,next) => {
    const orders = await Order.find({user:req.user._id});
    if(!orders){
        return next(new ErrorHandler("Order not found",400));
    }

    res.status(200).json({
        success:true,
        orders
    })
})

exports.getAllOrders = catchAsyncErrors(async(req,res,next) => {
    const orders = await Order.find();
    let totalAmount = 0;

    orders.forEach((order) => totalAmount += order.totalPrice);
    if(!orders){
        return next(new ErrorHandler("Order not found",400));
    }

    res.status(200).json({
        success:true,
        orders,
        totalAmount
    })
})

exports.updateOrderStatus = catchAsyncErrors(async(req,res,next) => {
    const order = await Order.findById(req.params.id);
    if(!order){
        return next(new ErrorHandler("Order not found",400));
    }

    if(order.orderStatus === "Delivered"){
        return next(new ErrorHandler("Order already delivered",400));
    }

    order.orderItems.forEach(async(item) => {
        await updateStock(item.product,item.quantity);
    })
    order.orderStatus = req.body.status;
    if(req.body.status === "Delivered"){
        order.deliveredAt = Date.now();
    }

    await order.save({validateBeforeSave:false})
    res.status(200).json({
        success:true,
        order
    })
})

async function updateStock(id,quantity){
    const product = await Product.findById(id);
    if(!product){
        return next(new ErrorHandler("Product not found",400));
    }

    product.stock -= quantity;

    await product.save({validateBeforeSave:false});
}

exports.deleteOrder = catchAsyncErrors(async(req,res,next) => {
    const order = await Order.findById(req.params.id);
    if(!order){
        return next(new ErrorHandler("Order not found",400));
    }

    await order.remove();
    res.status(200).json({
        success:true,
        message:"Order deleted successfully"
    })
})