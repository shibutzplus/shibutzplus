import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IProfession extends Document {
    _id: Types.ObjectId;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}

const ProfessionSchema = new Schema<IProfession>(
    {
        name: {
            type: String,
            required: [true, "Please provide a profession name"],
            maxlength: [100, "Profession name cannot be more than 100 characters"],
            unique: true,
        },
    },
    {
        timestamps: true,
    },
);

const Profession: Model<IProfession> = mongoose.models?.Profession || mongoose.model<IProfession>("Profession", ProfessionSchema);

export default Profession;