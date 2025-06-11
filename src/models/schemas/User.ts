import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { UserRole } from "../types/auth";

export interface IUser extends Document {
    _id: Types.ObjectId;
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: [true, "Please provide a name"],
            maxlength: [60, "Name cannot be more than 60 characters"],
        },
        email: {
            type: String,
            required: [true, "Please provide an email"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                "Please provide a valid email",
            ],
        },
        password: {
            type: String,
            required: [true, "Please provide a password"],
            minlength: [8, "Password must be at least 8 characters"],
            select: false, // Don't return password by default
        },
        role: {
            type: String,
            enum: ["principal", "deputy principal", "teacher"],
            default: "teacher",
        },
    },
    {
        timestamps: true,
    },
);

const User: Model<IUser> = mongoose.models?.User || mongoose.model<IUser>("User", UserSchema);

export default User;
