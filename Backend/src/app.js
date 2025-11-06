import express from "express";
import { globalErrorHandler } from "./middlewares/errorHandler.js";
import cookieParser from "cookie-parser"

const app = express();

//* Middleware
app.use(express.json({ limit: "32kb" }));
app.use(cookieParser());

//*********** importing router **********
import userRouter from "./routes/user.routes.js";

//*********** router declaration ********
app.use("/api/v1/users", userRouter);

//! this should be at the end to function properly
app.use(globalErrorHandler);

export { app };
