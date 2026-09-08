"use server";
//
// Used by autoAssignSchedule in DailyTableContext to persist multiple teacher
// substitution and event assignments in a single batch operation, avoiding repetitive
// server roundtrips, cache invalidations, and sync broadcasts.
//

import { db } from "@/db";
import { dailySchedule } from "@/db/schema/daily-schedule";
import { eq, and } from "drizzle-orm";
import { dbLog } from "@/services/loggerService";
import { pushSyncUpdateServer } from "@/services/sync/serverSyncService";
import { DAILY_TEACHER_COL_DATA_CHANGED } from "@/models/constant/sync";
import { revalidatePath, revalidateTag } from "next/cache";
import { cacheTags } from "@/lib/cacheTags";
import { ActionResponse } from "@/models/types/actions";
import { checkAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";

export interface BatchTeacherCellUpdate {
    id: string;
    subTeacherId?: string | null;
    event?: string | null;
}

export async function updateDailyTeacherCellsBatchAction(
    schoolId: string,
    date: string,
    updates: BatchTeacherCellUpdate[]
): Promise<ActionResponse> {
    if (!updates.length) return { success: true };

    try {
        const authError = await checkAuthAndParams({ schoolId });
        if (authError) {
            return authError;
        }

        // Neon HTTP driver doesn't support transactions, so we execute updates via Promise.all
        await Promise.all(
            updates.map((update) => {
                const updateValues: { subTeacherId?: string | null; event?: string | null } = {};
                if (update.subTeacherId !== undefined) {
                    updateValues.subTeacherId = update.subTeacherId;
                }
                if (update.event !== undefined) {
                    updateValues.event = update.event;
                }

                return db
                    .update(dailySchedule)
                    .set(updateValues)
                    .where(
                        and(
                            eq(dailySchedule.id, update.id),
                            eq(dailySchedule.schoolId, schoolId),
                        )
                    );
            })
        );

        revalidatePath("/daily-build");
        revalidateTag(cacheTags.schoolSchedule(schoolId));
        revalidateTag(cacheTags.dailySchedule(schoolId, date));
        await pushSyncUpdateServer(DAILY_TEACHER_COL_DATA_CHANGED, { schoolId, date });

        return {
            success: true,
            message: messages.dailySchedule.updateSuccess,
        };
    } catch (error) {
        dbLog({
            description: `Error batch updating daily teacher cells: ${error instanceof Error ? error.message : String(error)}`,
            schoolId,
            metadata: { date, count: updates.length }
        });
        return {
            success: false,
            message: messages.dailySchedule.updateError,
        };
    }
}
