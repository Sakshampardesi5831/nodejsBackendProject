import ApiError from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
 const verifyJwt= asyncHandler(async (req,res,next)=>{
    try {
        const token=req.cookies?.accessToken || req.header("Authorization").replace("Bearer ", "");
    
        if(!token){
            throw new ApiError(401,"Unauthorize token");
        }
       const decodedInformation=  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
      const user= await User.findById(decodedInformation?._id).select("-password -refreshToken");
      if(!user){
        //discuss about frontend
        throw new ApiError(401,"InValid AccessToken");
      }
      req.user=user;
      next();
    } catch (error) {
        throw new ApiError(401,error.message || "Invalid Access Token");
    }
});

export {verifyJwt}