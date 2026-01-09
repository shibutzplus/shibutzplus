"use server";

import { processHistoryUpdate } from "@/services/history/updateHistory";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import messages from "@/resources/messages";

export async function runHistoryUpdateAction() {
    try {
        const session = await getServerSession(authOptions);

        // Ensure user is authenticated
        if (!session) {
            return {
                success: false,
                message: messages.auth.unauthorized,
                logs: []
            };
        }

        const result = await processHistoryUpdate();

        return {
            success: result.success,
            message: "History update process completed.",
            logs: result.logs,
            stats: {
                schoolsUpdated: result.schoolsUpdated,
                recordsCount: result.recordsCount
            }
        };

    } catch (error) {
        console.error("Error running history update:", error);
        return {
            success: false,
            message: messages.common.serverError,
            logs: [String(error)]
        };
    }
}
