"use server";

import { dbLog, LogParams } from "@/services/loggerService";

/**
 * Server action to log errors from client-side components.
 */
export async function logErrorAction(params: LogParams) {
    const description = params.description || "";
    const lowercaseDescription = description.toLowerCase();
    const isNetworkError =
        lowercaseDescription.includes("failed to fetch") ||
        lowercaseDescription.includes("load failed") ||
        lowercaseDescription.includes("network error");

    if (isNetworkError) {
        /* // Log Network Error - This was comment out as we dont really need this log. Network errors sometimes can happen
        await dbLog({
             ...params,
             metadata: { ...(params.metadata ?? {}), errorType: "network" }
        });
        */
        return { success: true };
    }
    await dbLog(params);
    return { success: true };
}
