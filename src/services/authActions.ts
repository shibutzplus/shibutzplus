"use client";

import { RegisterRequest, SignInRequest } from "@/models/types/auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/schemas/User";
import bcrypt from "bcryptjs";
import { signIn } from "next-auth/react";
import msg from "@/resources/messages";

const signInWithCredentials = async (params: SignInRequest) => {
    try {
        const { email, password, remember } = params;
        if (!email || !password) {
            return { success: false, message: msg.auth.login.valid };
        }

        const res = await signIn("credentials", {
            redirect: false,
            email,
            password,
            remember,
        });

        if (res?.error) {
            return { success: false, message: msg.auth.login.failed };
        } else {
            return { success: true, message: msg.auth.login.success };
        }
    } catch (error) {
        return { success: false, message: msg.auth.serverError };
    }
};

const signUp = async (params: RegisterRequest) => {
    try {
        const { name, email, password, role } = params;

        if (!name || !email || !password || !role) {
            return { success: false, message: msg.auth.register.valid };
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

export { signInWithCredentials, signUp };
