"use server";

/** Detaches a single date's column from its recurring series, converting it into a standalone column. */

import { ActionResponse } from "@/models/types/actions";
import { checkAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { db, schema, executeQuery } from "@/db";
import { and, eq } from "drizzle-orm";
import { NewDailyScheduleSchema } from "@/db/schema";
import { dbLog } from "@/services/loggerService";
import { pushSyncUpdateServer } from "@/services/sync/serverSyncService";
import { DAILY_EVENT_COL_DATA_CHANGED } from "@/models/constant/sync";
import { revalidateTag } from "next/cache";
import { cacheTags } from "@/lib/cacheTags";
import { createId } from "@paralleldrive/cuid2";

export async function detachRecurringColumnAction(
    schoolId: string,
    columnId: string,
    date: string,
): Promise<ActionResponse & { newColumnId?: string }> {
    try {
        const authError = await checkAuthAndParams({ schoolId, columnId, date });
        if (authError) {
            return authError as ActionResponse;
        }

        const newColumnId = `col_${createId()}`;

        await executeQuery(() =>
            db
                .update(schema.dailySchedule)
                .set({ columnId: newColumnId } as Partial<NewDailyScheduleSchema>)
                .where(
                    and(
                        eq(schema.dailySchedule.schoolId, schoolId),
                        eq(schema.dailySchedule.date, date),
                        eq(schema.dailySchedule.columnId, columnId),
                    ),
                ),
        );

        revalidateTag(cacheTags.schoolSchedule(schoolId));
        revalidateTag(cacheTags.dailySchedule(schoolId, date));
        void pushSyncUpdateServer(DAILY_EVENT_COL_DATA_CHANGED, { schoolId, date });

        return {
            success: true,
            message: messages.dailySchedule.updateSuccess,
            newColumnId,
        };
    } catch (error) {
        dbLog({
            description: `Error detaching recurring column: ${error instanceof Error ? error.message : String(error)}`,
            schoolId,
            metadata: { columnId, date },
        });
        return { success: false, message: messages.common.serverError };
    }
}
