const mongoose = require("mongoose");
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please enter name"],
        minLength:[4,"Minimum 4 characters required"],
        maxLength:[30,"Name cannot exceed 30 characters"]
    },
    email:{
        type:String,
        required:[true,"Please enter email"],
        validate: [validator.isEmail,"Please enter valid email"],
        unique:true
    },
    password:{
        type:String,
        required:[true,"Please enter password"],
        minLength:[8,"Minimum 8 characters required"],
        select:false
    },
    avatar:{
        public_id:{
            type:String,
            required:true
        },
        url:{
            type:String,
            required:true
        }
    },
    role:{
        type:String,
        default:"User"
    },
    resetPasswordToken:{
        type:String,
    },
    resetPasswordExpiry:{
        type:Date,
    }
})

userSchema.pre("save",async function(next){
    if(!this.isModified("password")){
        next();
    }
    this.password = await bcrypt.hash(this.password,10);
});

userSchema.methods.comparePassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword,this.password);
}

userSchema.methods.getJwtToken = function(){
    return jwt.sign({id:this._id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRY
    });
}

userSchema.methods.getResetPassword = function(){
    const resetToken = crypto.randomBytes(20).toString("hex");
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.resetPasswordExpiry = Date.now() + 15 * 60 * 1000;
    return resetToken;
}

module.exports = mongoose.model("User",userSchema);