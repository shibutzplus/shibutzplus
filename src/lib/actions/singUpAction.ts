"use server";

import { RegisterRequest } from "@/models/types/auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/schemas/User";
import bcrypt from "bcryptjs";
import msg from "@/resources/messages";

const signUp = async (params: RegisterRequest) => {
    try {
        const { name, email, password, role } = params;

        if (!name || !email || !password || !role) {
            return { success: false, message: msg.auth.register.invalid };
        }

        await connectToDatabase();
        if (await User.findOne({ email })) {
            return { success: false, message: msg.auth.register.emailInUse };
        }

        const hash = await bcrypt.hash(password, 10);
        await User.create({ name, email, password: hash, role });
        return { success: true, message: msg.auth.register.success };
    } catch (error) {
        return { success: false, message: msg.auth.register.failed };
    }
};

export default signUp;
