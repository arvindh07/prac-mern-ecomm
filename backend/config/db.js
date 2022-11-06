const mongoose = require("mongoose");

const connectToDB = () => {
    mongoose.connect("mongodb://localhost:27017/dummyecomm",{
        useUnifiedTopology:true,
        useNewUrlParser:true,
    }).then(() => {
        console.log("Connected to mongodb successfully");
    }) 
}

module.exports = connectToDB;