"use client";

import { signIn } from "next-auth/react";
import msg from "@/resources/messages";

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
    } catch {
        return { success: false, message: msg.common.serverError };
    }
};
