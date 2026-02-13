"use server";

import { ActionResponse } from "@/models/types/actions";
import { checkAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { db, schema, executeQuery } from "@/db";
import { and, eq } from "drizzle-orm";
import { dbLog } from "@/services/loggerService";
import { pushSyncUpdateServer } from "@/services/sync/serverSyncService";
import { DAILY_EVENT_COL_DATA_CHANGED, DAILY_TEACHER_COL_DATA_CHANGED } from "@/models/constant/sync";
import { ColumnTypeValues } from "@/models/types/dailySchedule";
import { revalidateTag } from "next/cache";
import { cacheTags } from "@/lib/cacheTags";

export async function deleteDailyCellAction(
    schoolId: string,
    dailyRowId: string,
): Promise<ActionResponse & { deletedRowId?: string }> {
    try {
        const authError = await checkAuthAndParams({ schoolId, dailyRowId });
        if (authError) {
            return authError as ActionResponse;
        }

        let deletedType: number | undefined;
        let date: string | undefined;

        const deleted = await executeQuery(async () => {
            const deletedRows = await db
                .delete(schema.dailySchedule)
                .where(
                    and(
                        eq(schema.dailySchedule.schoolId, schoolId),
                        eq(schema.dailySchedule.id, dailyRowId),
                    ),
                )
                .returning({ columnType: schema.dailySchedule.columnType, date: schema.dailySchedule.date });

            if (deletedRows.length > 0) {
                deletedType = deletedRows[0].columnType;
                date = deletedRows[0].date;
            }

            return deletedRows.length;
        });

        if (deleted > 0) {
            if (date && deletedType !== undefined) {
                // Always invalidate cache - admins need to see updates even on unpublished dates
                revalidateTag(cacheTags.schoolSchedule(schoolId));

                if (deletedType === ColumnTypeValues.event) {
                    void pushSyncUpdateServer(DAILY_EVENT_COL_DATA_CHANGED, { schoolId, date });
                } else if (deletedType === ColumnTypeValues.missingTeacher || deletedType === ColumnTypeValues.existingTeacher) {
                    void pushSyncUpdateServer(DAILY_TEACHER_COL_DATA_CHANGED, { schoolId, date });
                }
            }

            return {
                success: true,
                message: messages.dailySchedule.deleteSuccess,
                deletedRowId: dailyRowId,
            };
        } else {
            return {
                success: false,
                message: messages.dailySchedule.deleteError,
            };
        }
    } catch (error) {
        dbLog({ description: `Error deleting daily schedule column: ${error instanceof Error ? error.message : String(error)}`, schoolId });
        return {
            success: false,
            message: messages.dailySchedule.deleteError,
        };
    }
}
