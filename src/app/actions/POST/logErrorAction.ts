"use server";

import { dbLog, LogParams } from "@/services/loggerService";

/**
 * Server action to log errors from client-side components.
 */
export async function logErrorAction(params: LogParams) {
    const description = params.description || "";
    const lowercaseDescription = description.toLowerCase();
    if (
        lowercaseDescription.includes("failed to fetch") ||
        lowercaseDescription.includes("load failed") ||
        lowercaseDescription.includes("network error")
    ) {
        return { success: true };
    }
    await dbLog(params);
    return { success: true };
}
