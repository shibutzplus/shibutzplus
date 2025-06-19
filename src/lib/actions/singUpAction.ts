"use server";

import { RegisterRequest } from "@/models/types/auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/schemas/User";
import School from "@/models/schemas/School";
import bcrypt from "bcryptjs";
import msg from "@/resources/messages";

const signUp = async (params: RegisterRequest) => {
    try {
        const { name, email, password, role, school: schoolName } = params;

        if (!name || !email || !password || !role || !schoolName) {
            return { success: false, message: msg.auth.register.invalid };
        }

        await connectToDatabase();
        if (await User.findOne({ email })) {
            return { success: false, message: msg.auth.register.emailInUse };
        }

        const hash = await bcrypt.hash(password, 10);

        let schoolId;
        const existingSchool = await School.findOne({ name: schoolName });

        // For principal role, create a new school
        if (role === "principal") {
            if (existingSchool) return { success: false, message: msg.auth.register.schoolExist };
            const newSchool = await School.create({
                name: schoolName,
                teachers: [],
                classes: [],
                professions: [],
                status: "onboarding",
            });
            schoolId = newSchool._id;
        } else {
            // For non-principal roles, add user to existing school
            if (!existingSchool)
                return { success: false, message: msg.auth.register.schoolNotFound };
            schoolId = existingSchool._id;
        }

        await User.create({
            name,
            email,
            password: hash,
            role,
            school: schoolId,
        });

        return { success: true, message: msg.auth.register.success };
    } catch (error) {
        return { success: false, message: msg.auth.register.failed };
    }
};

export default signUp;
