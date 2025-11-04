import { User } from "../models/user.model.js";
import { logger } from "../utils/logger.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";

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
        console.log(req.body);
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
            -"password",
            -"refreshToken",
        );

        //* send cookies

        const options = {
            httponly: true,
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

export { registerUser, loginUser };
