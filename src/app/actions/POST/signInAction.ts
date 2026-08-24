"use client";

import { signIn } from "next-auth/react";
import msg from "@/resources/messages";
import { AUTH_TYPE } from "@/models/constant/auth";
import routes from "@/routes";

export const signInWithGoogle = async (callbackUrl: string = "/") => {
    try {
        const res = await signIn(AUTH_TYPE.GOOGLE, {
            callbackUrl,
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
