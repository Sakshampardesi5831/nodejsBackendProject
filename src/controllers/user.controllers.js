import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import DataUriParser from "datauri/parser.js";
import User from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
const generateAccessTokenAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Some thing went wrong while generating access token and refreshToken"
    );
  }
};

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
    avatar: "",
    coverImage: "",
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

export const loginUser = asyncHandler(async (req, res) => {
  //req.body ->data
  //username or email
  //find the user
  //password check
  //accesstoken and refreshtoken
  //send cookies
  const { email, password, username } = req.body;
  if (!(email || username)) {
    throw new ApiError(400, "Email or username is required");
  }
  const user = await User.findOne({
    $or: [{ email: email }, { username: username }],
  });
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Password Incorrect !!!");
  }
  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(user._id);
  const loggedInUser = await User.findById(user._id).select("-password");

  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, {
        user: loggedInUser,
        accessToken,
        refreshToken,
      })
    );
});

export const logoutUser = asyncHandler(async (req, res) => {
  User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    { new: true }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, "Logged Out Successfully"));
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    const incomingRefreshToken =
      req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) {
      throw new ApiError(400, "Unauthorized Request");
    }
    const decodedRefreshToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedRefreshToken._id);
    if (!user) {
      throw new ApiError(401, "Invalid Refresh Token");
    }
    if (user?.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401, "Refresh Token is Expired or used");
    }
    const option = {
      httpOnly: true,
      secure: true,
    };
    const { accessToken, newRefreshToken } =
      await generateAccessTokenAndRefreshToken(user._id);
    return res
      .status(200)
      .cookie("accessToken", accessToken)
      .cookie("refreshToken", newRefreshToken)
      .json(
        new ApiResponse(200, { accessToken, refreshToken: newRefreshToken })
      );
  } catch (error) {
    throw new ApiError(401, "Something went Wrong !!!");
  }
});

export const currentUserPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id);
  isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Old Password is incorrect");
  }
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, "Password Changed Successfully"));
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, "User fetch SuccessFully !!!", req.user));
});

export const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (!fullName || !email) {
    throw new ApiError(400, "All fields are compulsory");
  }

  const updateUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        fullName,
        email,
      },
    },
    { new: true }
  ).select("-password");
  //  await updateUser.save({validateBeforeSave:false});
  return res
    .status(200)
    .json(new ApiResponse(200, "User Updated SuccessFully !!!", updateUser));
});

export const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar?.url) {
    throw new ApiError(400, "Error while uploading the file on Avatar");
  }

  const updateUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password");
  return res
    .status(200)
    .json(
      new ApiResponse(200, "CoverImage Updated SuccessFully !!!", updateUser)
    );
});

export const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage?.url) {
    throw new ApiError(400, "Error while uploading the file on Avatar");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, "CoverImage Updated SuccessFully !!!", user));
});

export const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username?.trim()) {
    throw new ApiError(400, "Username is missing !!!");
  }
  const channel = await User.aggregate([
    {
      $match: { username: username.toLowerCase() },
    },
    {
      $lookup: {
        from: "Subscription",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "Subscription",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: { $size: "$subscribers" },
        channelsSubscribeToCount: { $size: "$subscribedTo" },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        subscribersCount: 1,
        channelsSubscribeToCount: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);

  if (!channel?.length) {
    throw new ApiError(404, "Channel Does not Exist  !!!");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, "User Channel Fetch SuccessFully", channel[0]));
});

export const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(req.user._id) },
    },
    {
      $lookup: {
        from: "Video",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "User",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        " Watch History Fetch SuccessFully ",
        user[0].watchHistory
      )
    );
});
