import { Router } from "express";
import { register,loginUser,logoutUser } from "../controllers/user.controllers.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJwt } from "../middlewares/myauth.middleware.js";

 const routes = Router();

routes.route("/register").post(upload.fields([
    {name:"avatar",maxCount:1},
    {name:"coverimage",maxCount:1}
]),register);

routes.route("/login").post(loginUser);


//secure Routes 

routes.route("/logout").post(verifyJwt,logoutUser);

export default routes;
