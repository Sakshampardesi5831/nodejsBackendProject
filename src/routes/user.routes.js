import {Router} from 'express'
import {register} from '../controllers/user.controllers.js'
const routes=Router();

routes.route("/register").post(register)



export default routes;