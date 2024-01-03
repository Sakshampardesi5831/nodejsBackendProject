import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import DataUriParser from "datauri/parser.js";
import User from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
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
  if (
    [fullName, email, username, password].some((field) => field?.trim === "")
  ) {
    throw new ApiError(400, "All fields are compulsory");
  }
  const duplicateUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  /*if (duplicateUser) {
    throw new ApiError(409, "User Username and Email Already exist");
  }
  console.log(req.files);
  const avatarLocalPath = req.files["avatar"][0];
  console.log(avatarLocalPath);
  const coverLocalPath = req.files["coverimage"][0];
  console.log(coverLocalPath);
  if (!avatarLocalPath.path) {
    throw new ApiError(400, " Avatar is required");
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath.path);
  console.log("after file response" + avatar);
  const coverImage = await uploadOnCloudinary(coverLocalPath.path);
  console.log("after file response" + coverImage);
  if (!avatar) {
    throw new ApiError(400, "Avatar file is required !!!");
  }*/
  const user = await User.create({
    fullName,
    avatar:"",
    coverImage:"",
    email,
    password,
    username: username.toLowerCase(),
  });
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "User Registered failed !!!");
  }
  return res
    .status(201)
    .json(new ApiResponse(201, "User Registered Successfully", createdUser));
});
