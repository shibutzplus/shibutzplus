"use server";

import { dbLog, LogParams } from "@/services/loggerService";

/**
 * Server action to log errors from client-side components.
 */
export async function logErrorAction(params: LogParams) {
    const description = params.description || "";
    if (description.includes("Failed to fetch") || description.includes("Load failed")) {
        return { success: true };
    }
    await dbLog(params);
    return { success: true };
}
