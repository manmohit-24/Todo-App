import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt, { hash } from "bcrypt"

const user = new Schema(
    {
        name: {
            type: String,
            unique: true, //? 
            required: true,
            trim: true,
        },
        username: {
            type: String,
            unique: true,
            required: true,
            trim: true,
            index: true,
        },
        email: {
            type: String,
            unique: true,
            required: true,
            trim: true,
            index: true,
        },
        password: {
            type: String,
            required: true,
            trim: true,
        },
        refreshToken: {
            type: String ,
        }
    },
    {
        timestamps: true,
    },
);

user.pre("save" , async function (next) {
    
    if(!this.isModified("password")) return next();

    
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password,salt)
    next();
    
})

user.methods.isPasswordCorrect = async function (password) {
    
    return await bcrypt.compare(password,this.password);
}

user.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id:this._id
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

user.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id:this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}
export const User = mongoose.model("User", user);