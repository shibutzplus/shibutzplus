import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { ITeacher } from "./Teacher";
import { IClass } from "./Class";
import { IProfession } from "./Professions";
import { SchoolStatus, SchoolType } from "../types/school";

export interface ISchool extends Document {
    _id: Types.ObjectId;
    name: string;
    type: SchoolType;
    teachers: Types.ObjectId[] | ITeacher[];
    classes: Types.ObjectId[] | IClass[];
    professions: Types.ObjectId[] | IProfession[];
    status: SchoolStatus;
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
        type: {
            type: String,
            enum: ["Elementary", "Middle", "High"],
            default: "Elementary",
        },
        teachers: [
            {
                type: Schema.Types.ObjectId,
                ref: "Teacher",
            },
        ],
        classes: [
            {
                type: Schema.Types.ObjectId,
                ref: "Class",
            },
        ],
        professions: [
            {
                type: Schema.Types.ObjectId,
                ref: "Profession",
            },
        ],
        status: {
            type: String,
            enum: ["onboarding", "annual", "daily"],
            default: "onboarding",
        },
    },
    {
        timestamps: true,
    },
);

const School: Model<ISchool> =
    mongoose.models?.School || mongoose.model<ISchool>("School", SchoolSchema);

export default School;
