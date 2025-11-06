import { User } from "../models/user.model.js";
import { logger } from "../utils/logger.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { verifyJWT } from "../middlewares/authMiddleware.js";
import jwt from "jsonwebtoken"

const registerUser = async (req, res, next) => {
    try {
        const { email, name, username, password } = req.body;

        if ([email, name, username, password].some((field) => !field)) {
            throw new apiError(400, "all fields are req");
        }

        const existedUser = await User.findOne({
            $or: [{ username }, { email }],
        });

        if (existedUser) {
            throw new apiError(409, "user already exists");
        }

        const user = await User.create({
            username,
            email,
            password,
            name,
        });

        const createdUser = await User.findById(user._id).select("-password");

        if (!createdUser) {
            throw new apiError(500, "error while registering the user");
        }

        return res.status(201).json(new apiResponse(201, createdUser));
    } 
    catch (error) {
        next(error);
    }
};

const loginUser = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        if (!(username || email)) {
            throw new apiError(400, "missing username or email");
        }

        if (!password) {
            throw new apiError(400, "password is required");
        }

        const user = await User.findOne({
            $or: [{ username }, { email }],
        });

        if (!user) {
            throw new apiError(404, "user not found");
        }

        const validPassword = await user.isPasswordCorrect(password);
        
        if (!validPassword) {
            throw new apiError(401, "please enter valid password ");
        }

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        const loggedInUser = await User.findById(user._id).select(
            -"password -refreshToken",
        );

        //* send cookies

        const options = {
            httpOnly: true,
            secure: true,
        };

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new apiResponse(
                    200,
                    {
                        user: loggedInUser,
                        accessToken,
                        refreshToken,
                    },
                    "user logged in successfully",
                ),
            );
    } catch (error) {
        next(error);
    }
};

const logoutUser = async(req,res,next) => {

    //first it goes to verifyJWT
   try {
    await User.findByIdAndUpdate(req.user._id,
     {
         $unset:{refreshToken : 1}
     },
     { 
         new:true
     })
 
     const options = {
         httpOnly:true,
         secure:true
     }
 
     return res
     .status(200)
     .clearCookie("accessToken" , options)
     .clearCookie("refreshToken" , options)
     .json(new apiResponse(200, {} ,"user logged out successfully"))
   } catch (error) {
        next(error);
   }
};

const refreshAccessToken = async (req, res, next) => {
    try {
        const incomingToken = req.cookies.refreshToken || req.body.refreshToken;

        if (!incomingToken) {
            throw new apiError(401, "Unauthorized request: No refresh token");
        }

        let decodedToken;
        try {
            decodedToken = jwt.verify(incomingToken, process.env.REFRESH_TOKEN_SECRET);

        } catch (jwtError) {
             if (jwtError.name === 'TokenExpiredError') {
                throw new apiError(401, "Token expired"); //using an old token with same secret key
            }
            throw new apiError(401, "Invalid token");  // All other JWT errors
        }         
        
        const user = await User.findById(decodedToken?._id);

        if (!user) {
            throw new apiError(404, "Invalid refresh token: User not found");
        }

        if (incomingToken !== user.refreshToken) {
            throw new apiError(401, "Refresh token is expired or used");
        }

        const accessToken = user.generateAccessToken();
        const newRefreshToken = user.generateRefreshToken();

        
        user.refreshToken = newRefreshToken;
        await user.save({ validateBeforeSave: false });

        const options = {
            httpOnly: true,
            secure: true,
        };

       
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new apiResponse(
                    200,
                    {
                        accessToken,
                        refreshToken: newRefreshToken,
                    },
                    "Access token refreshed"
                )
            );
    } catch (error) {
        
        next(error);
    }
};

const getUserProfile = async (req,res,next) => {

    const user = req.user;

    return res.status(200)
    .json(
        new apiResponse(200,user,"fetched curr user successfully")
    )
};

const changeCurrentPassword = async (req,res,next) => {

    try {
        const user = await User.findById(req.user?._id).select("+password");

        const {oldPassword , newPassword} = req.body;
        
        if(!oldPassword || !newPassword){
            throw new apiError(400 , "both fields are required");
        }

        if(oldPassword === newPassword){
            throw new apiError (400, "new password cannot be same as old password")
        }

        const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

        if(!isPasswordCorrect){
            throw new apiError(401, "plz enter valid password");
        }
        
        user.password = newPassword;
        await user.save();

        user.refreshToken = undefined;
        await user.save({validateBeforeSave:false});

        const options = {
            httpOnly:true,
            secure:true
        }

        return res.status(200)
        .clearCookie("accessToken",options)
        .json(
            new apiResponse(200,{},"password changed successfully")
        )

    } catch (error) {
        next(error);
    }
}



export { registerUser, loginUser, logoutUser, refreshAccessToken, getUserProfile,changeCurrentPassword};
