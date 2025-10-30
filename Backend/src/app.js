import express from "express";
import { registerUser } from "./controllers/user.controller.js";
import { logger } from "./utils/index.js";

const app = express();

// Middleware for accepting json
app.use(express.json({ limit: "32kb" }));

// app.post("/register", (req, res) => {
//     console.log("Req : ", req.body);

//     registerUser(req , res)
//         .catch((err) => {
//             logger.error( "Error /register" ,  err);
//             res.status(400).json(err);
//         });
// });

//*********** importing router **********
import userRouter from "./routes/user.routes.js";


//*********** router declaration ********
app.use("/api/v1/users" , userRouter)

export { app };
