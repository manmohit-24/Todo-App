import dotenv from "dotenv";
import { connectDB } from "./db/index.js";
import { logger } from "./utils/logger.js";
import { app } from "./app.js";

dotenv.config({
    path: "./.env",
});

logger.seperator();

const port = process.env.PORT;

// ******************** Connecting to DataBase and app ****************
connectDB()
.then( () => {
    app.listen(port, () => {
    logger.success("Express connected", `Running at port ${port}`);
    });
})
.catch((err) => {
    console.log('APP CONNECTION FAILED' , err)
 })





 