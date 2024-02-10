import { Router } from "express";
import {
  register,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentUserPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
} from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/myauth.middleware.js";
const routes = Router();
routes.route("/register").post(
  upload.fields([
    { name: "avatar" },
    { name: "coverimage"},
  ]),
  register
);
routes.route("/login").post(loginUser);
//secure Routes
routes.route("/logout").post(verifyJwt, logoutUser);
routes.route("/refresh-token").post(refreshAccessToken);
routes.route("/change-password").post(verifyJwt, changeCurrentUserPassword);
routes.route("/current-user").post(verifyJwt, getCurrentUser);
routes.route("/update-details").patch(verifyJwt, updateAccountDetails);
routes
  .route("/avatar")
  .patch(verifyJwt, upload.single("avatar"), updateUserAvatar);
routes
  .route("/coverImage")
  .patch(verifyJwt, upload.single("coverimage"), updateUserCoverImage);
routes.route("/channel/:username").get(verifyJwt, getUserChannelProfile);
routes.route("/history").get(verifyJwt, getWatchHistory);
export default routes;
