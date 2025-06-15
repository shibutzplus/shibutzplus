import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { TeacherRole, TeacherRoleValues } from "../types/teachers";

export interface ITeacher extends Document {
    _id: Types.ObjectId;
    name: string;
    role: TeacherRole;
    subject?: string;
    classes: string[];
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const TeacherSchema = new Schema<ITeacher>(
    {
        name: {
            type: String,
            required: [true, "Please provide a name"],
            maxlength: [100, "Name cannot be more than 100 characters"],
        },
        role: {
            type: String,
            enum: Object.values(TeacherRoleValues),
            required: [true, "Please provide a role"],
        },
        subject: {
            type: String,
            maxlength: [100, "Subject cannot be more than 100 characters"],
        },
        classes: [{
            type: String,
        }],
        notes: {
            type: String,
            maxlength: [500, "Notes cannot be more than 500 characters"],
        },
    },
    {
        timestamps: true,
    },
);

const Teacher: Model<ITeacher> = mongoose.models?.Teacher || mongoose.model<ITeacher>("Teacher", TeacherSchema);

export default Teacher;
