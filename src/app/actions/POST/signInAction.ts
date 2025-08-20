"use client";

import { SignInRequest, SignInResponse } from "@/models/types/auth";
import { signIn } from "next-auth/react";
import msg from "@/resources/messages";

export const signInWithCredentials = async (params: SignInRequest): Promise<SignInResponse> => {
    try {
        const { email, password, remember } = params;
        if (!email || !password) {
            return { success: false, message: msg.auth.login.invalid };
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

export const signInWithGoogle = async () => {
    try {
        const res = await signIn("google", {
            redirect: false,
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
