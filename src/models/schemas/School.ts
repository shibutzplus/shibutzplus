import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { ITeacher } from "./Teacher";

export interface ISchool extends Document {
    _id: Types.ObjectId;
    name: string;
    teachers: Types.ObjectId[] | ITeacher[];
    createdAt: Date;
    updatedAt: Date;
}

const SchoolSchema = new Schema<ISchool>(
    {
        name: {
            type: String,
            required: [true, "Please provide a school name"],
            maxlength: [100, "School name cannot be more than 100 characters"],
            unique: true,
        },
        teachers: [{
            type: Schema.Types.ObjectId,
            ref: "Teacher"
        }],
    },
    {
        timestamps: true,
    },
);

const School: Model<ISchool> = mongoose.models?.School || mongoose.model<ISchool>("School", SchoolSchema);

export default School;