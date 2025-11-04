import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";
import { apiError } from "../utils/apiError.js";

export const verifyJWT = async (req,res,next) => {
 try {
    
       const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
       
       if (!token) {
               throw new apiError(401, "Unauthorized request: No token provided");
           }
       
       let decodedToken;
        try {
            decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        } catch (jwtError) {
            // Normalize JWT errors to error format
            if (jwtError.name === 'TokenExpiredError') {
                throw new apiError(401, "Token expired");
            }
            throw new apiError(401, "Invalid token");  // All other JWT errors
        }

       const user = await User.findById(decodedToken._id).select("-password -refreshToken");
   
       if(!user){
           throw new apiError(404, "user not found:invalid access token");
       }
   
       req.user = user;
   
       next();
   
 } catch (error) {
    next(error);
 }
}       