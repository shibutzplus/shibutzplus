"use server";

/** Deletes a recurring event column from a specified date onwards. */

import { ActionResponse } from "@/models/types/actions";
import { checkAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { db, schema, executeQuery } from "@/db";
import { and, eq, gte } from "drizzle-orm";
import { dbLog } from "@/services/loggerService";
import { pushSyncUpdateServer } from "@/services/sync/serverSyncService";
import { DAILY_EVENT_COL_DATA_CHANGED } from "@/models/constant/sync";
import { revalidateTag } from "next/cache";
import { cacheTags } from "@/lib/cacheTags";

export async function deleteRecurringFromDateAction(
    schoolId: string,
    columnId: string,
    fromDate: string,
): Promise<ActionResponse> {
    try {
        const authError = await checkAuthAndParams({ schoolId, columnId, date: fromDate });
        if (authError) {
            return authError as ActionResponse;
        }

        // Get the distinct dates that will be affected (for sync notifications)
        const affectedRows = await executeQuery(() =>
            db
                .select({ date: schema.dailySchedule.date })
                .from(schema.dailySchedule)
                .where(
                    and(
                        eq(schema.dailySchedule.schoolId, schoolId),
                        eq(schema.dailySchedule.columnId, columnId),
                        gte(schema.dailySchedule.date, fromDate),
                    ),
                ),
        );

        const affectedDates = [...new Set(affectedRows.map((r) => r.date))];

        if (!affectedDates.length) {
            return { success: true, message: messages.dailySchedule.deleteSuccess };
        }

        // Delete all rows from fromDate onwards
        await executeQuery(() =>
            db
                .delete(schema.dailySchedule)
                .where(
                    and(
                        eq(schema.dailySchedule.schoolId, schoolId),
                        eq(schema.dailySchedule.columnId, columnId),
                        gte(schema.dailySchedule.date, fromDate),
                    ),
                ),
        );

        // Invalidate cache and push sync for each affected date
        revalidateTag(cacheTags.schoolSchedule(schoolId));
        for (const date of affectedDates) {
            revalidateTag(cacheTags.dailySchedule(schoolId, date));
            void pushSyncUpdateServer(DAILY_EVENT_COL_DATA_CHANGED, { schoolId, date });
        }

        return { success: true, message: messages.dailySchedule.deleteSuccess };
    } catch (error) {
        dbLog({
            description: `Error deleting recurring column from date: ${error instanceof Error ? error.message : String(error)}`,
            schoolId,
            metadata: { columnId, fromDate },
        });
        return { success: false, message: messages.common.serverError };
    }
}
