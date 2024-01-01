import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import User from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import {ApiResponse} from '../utils/ApiResponse.js'
export const register = asyncHandler(async (req, res) => {
  //get details from frontend
  //validation not empty
  //check is username and email already existed
  //check for images and check for avatar
  //upload them to cloudinary,avatar
  //create user-object and entry in database
  // remove password and refresh token from response
  //check for user creation
  //return response
  const { fullName, email, username, password } = req.body;
  console.log(email);
  if (
    [fullName, email, username, password].some((field) => field?.trim === "")
  ) {
    throw new ApiError(400, "All fields are compulsory");
  }
  const duplicateUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (duplicateUser) {
    throw new ApiError(409, "User Username and Email Already exist");
  }

  const avatarLocalPath = req.files.avatar[0]?.path;
  const coverLocalPath = req.files.coverimage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, " Avatar is required");
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverLocalPath);

  if(!avatar){
    throw new ApiError(400,"Avatar file is required !!!");
  }
   const user= await  User.create({
    fullName,
    avatar:avatar.url,
    coverImage:coverImage?.url || "",
    email,
    password,
    username:username.toLowerCase()
  })
 const createdUser= await User.findById(user._id).select(
  "-password -refreshToken"
 )

 if(!createdUser){
  throw new ApiError(500,"User Registered failed !!!");
 }
  return res.status(201).json(
    new ApiResponse(201,"User Registered Successfully",createdUser)
  )
});
