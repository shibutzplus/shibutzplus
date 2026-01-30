"use server";

import msg from "@/resources/messages";
import { dbLog } from "@/services/loggerService";
import { ActionResponse } from "@/models/types/actions";

export const signInWithCredentials = async (
    email: string,
    password: string
): Promise<ActionResponse> => {
    try {
        if (!email || !password) {
            return { success: false, message: msg.auth.login.failed };
        }

        return { success: true, message: msg.auth.login.success };
    } catch (error) {
        dbLog({ description: `Admin sign-in error: ${error instanceof Error ? error.message : String(error)}`, metadata: { email } });
        return { success: false, message: msg.common.serverError };
    }
};
