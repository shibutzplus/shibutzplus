"use server";

import { dbLog, LogParams } from "@/services/loggerService";

/**
 * Server action to log errors from client-side components.
 */
export async function logErrorAction(params: LogParams) {
    await dbLog(params);
    return { success: true };
}
