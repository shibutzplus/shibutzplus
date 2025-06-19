import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { ITeacher } from "./Teacher";

export interface IClass extends Document {
    _id: Types.ObjectId;
    name: string;
    classTeacher: Types.ObjectId | ITeacher;
    createdAt: Date;
    updatedAt: Date;
}

const ClassSchema = new Schema<IClass>(
    {
        name: {
            type: String,
            required: [true, "Please provide a class name"],
            maxlength: [100, "Class name cannot be more than 100 characters"],
        },
        classTeacher: {
            type: Schema.Types.ObjectId,
            ref: "Teacher",
            required: [true, "Please provide a class teacher"],
        },
    },
    {
        timestamps: true,
    },
);

const Class: Model<IClass> = mongoose.models?.Class || mongoose.model<IClass>("Class", ClassSchema);

export default Class;