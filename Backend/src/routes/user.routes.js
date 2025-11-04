import {Router} from "express"
import {logoutUser, registerUser} from "../controllers/user.controller.js"
import { loginUser } from "../controllers/user.controller.js";
import {verifyJWT} from "../middlewares/authMiddleware.js"

const router = new Router();

router.route("/register").post(registerUser)

router.route("/login").post(loginUser)

router.route("/logout").post(verifyJWT,logoutUser);

export default router