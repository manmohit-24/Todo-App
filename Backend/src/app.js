import express from "express";
import { registerUser } from "./controllers/user.controller.js";
import { logger } from "./utils/index.js";
import { globalErrorHandler } from "./middlewares/errorHandler.js";

const app = express();

//* Middleware 
app.use(express.json({ limit: "32kb" }));

//*********** importing router **********
import userRouter from "./routes/user.routes.js";


//*********** router declaration ********
app.use("/api/v1/users" , userRouter)








//! this should be at the end to function properly
app.use(globalErrorHandler);

export { app };
