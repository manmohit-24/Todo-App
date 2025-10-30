import mongoose from "mongoose";
import { logger } from "../utils/index.js";

export const connectDB = async () => {
    const MONGODB_URI = process.env.MONGODB_URI;
    const DB_NAME = process.env.DB_NAME;

    try {
        const connectionInstance = await mongoose.connect(
            `${MONGODB_URI}/${DB_NAME}`, 
        );

        logger.success(
            "MongoDB Connected Successfully",
            connectionInstance.connection.host,
        );
    } catch (error) {
        logger.error("MongoDB Connection error", error);
        process.exit(1);
    }
};
