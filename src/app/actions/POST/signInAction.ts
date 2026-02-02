"use client";

import { signIn } from "next-auth/react";
import msg from "@/resources/messages";
import { AUTH_TYPE } from "@/models/constant/auth";

export const signInWithGoogle = async () => {
    try {
        const res = await signIn(AUTH_TYPE.GOOGLE, {
            redirect: false,
        });

        if (res?.error) {
            return { success: false, message: msg.auth.login.failed };
        } else {
            return { success: true, message: msg.auth.login.success, url: res?.url };
        }
    } catch {
        return { success: false, message: msg.common.serverError };
    }
};
