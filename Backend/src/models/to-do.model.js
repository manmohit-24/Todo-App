import mongoose, {Schema} from "mongoose";

import mongoose, { Schema } from "mongoose";

const todoSchema = new Schema(
    {
        content: {
            type: String,
            required: true,
            trim: true,
        },
        completed: {
            type: Boolean,
            default: false,
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        project: {
            type: Schema.Types.ObjectId,
            ref: "Project",
            required: true, 
            index: true
        },
        section: {
            type: String,
            trim: true,
            default: null,
        },
        parentTask: {
            type: Schema.Types.ObjectId,
            ref: "Todo",
            default: null,
        },
        priority: {
            type: Number,
            enum: [1, 2, 3, 4], // 1=Urgent, 2=High, 3=Medium, 4=Low/None
            default: 4,
            index: true 
        },
        order: { // For drag-and-drop reordering
            type: Number,
            default: 0,
            index: true 
        },
        dueDate: {
            type: Date,
            default: null,
        },
        tags: [
            {
                type: String,
                trim: true,
                lowercase: true
            }
        ]
    },
    {
        timestamps: true
    }
);

export const Todo = mongoose.model("Todo", todoSchema);