"use server";

import { ColumnTypeValues, DailyScheduleType, DailyScheduleRequest } from "@/models/types/dailySchedule";
import { ActionResponse } from "@/models/types/actions";
import { checkAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { eq } from "drizzle-orm";
import { db, schema, executeQuery } from "../../../db";
import { dbLog } from "@/services/loggerService";
import { NewDailyScheduleSchema } from "@/db/schema";
import { getDateReturnString, getStringReturnDate } from "@/utils/time";
import { pushSyncUpdateServer } from "@/services/sync/serverSyncService";
import { DAILY_EVENT_COL_DATA_CHANGED } from "@/models/constant/sync";
import { revalidateTag } from "next/cache";
import { cacheTags } from "@/lib/cacheTags";

export async function updateDailyGuardCellAction(
    id: string,
    scheduleData: DailyScheduleRequest,
): Promise<ActionResponse & { data?: DailyScheduleType }> {
    const { date, day, hour, columnId, school, position } = scheduleData;
    try {
        const authError = await checkAuthAndParams({
            id,
            date,
            day,
            hour,
            columnId,
            schoolId: school.id,
            position,
        });
        if (authError) {
            return authError as ActionResponse;
        }

        const updatedEntry = await executeQuery(async () => {
            return await db
                .update(schema.dailySchedule)
                .set({
                    date: getDateReturnString(date),
                    day,
                    hour,
                    columnId,
                    schoolId: school.id,
                    columnType: ColumnTypeValues.guard,
                    position,
                    eventTitle: scheduleData.eventTitle ?? null,
                    event: scheduleData.event ?? null,
                    guardTeacherIds: scheduleData.guardTeacherIds ?? null,
                    instructions: scheduleData.instructions ?? null,
                } as Partial<NewDailyScheduleSchema>)
                .where(eq(schema.dailySchedule.id, id))
                .returning();
        });

        if (!updatedEntry[0]) {
            return {
                success: false,
                message: messages.dailySchedule.updateError,
            };
        }

        const updateSchedule = updatedEntry[0];

        // Invalidate all schedule caches for this school
        revalidateTag(cacheTags.schoolSchedule(school.id));
        revalidateTag(cacheTags.dailySchedule(school.id, getDateReturnString(date)));

        await pushSyncUpdateServer(DAILY_EVENT_COL_DATA_CHANGED, { schoolId: school.id, date: getDateReturnString(date) });

        return {
            success: true,
            message: messages.dailySchedule.updateSuccess,
            data: {
                id: updateSchedule.id,
                date: getStringReturnDate(updateSchedule.date),
                day: updateSchedule.day,
                hour: updateSchedule.hour,
                columnId: updateSchedule.columnId,
                createdAt: updateSchedule.createdAt,
                updatedAt: updateSchedule.updatedAt,
                school,
                columnType: ColumnTypeValues.guard,
                position,
                eventTitle: updateSchedule.eventTitle ?? undefined,
                event: updateSchedule.event ?? undefined,
                guardTeacherIds: updateSchedule.guardTeacherIds ?? undefined,
                instructions: updateSchedule.instructions ?? undefined,
            } as DailyScheduleType,
        };
    } catch (error) {
        dbLog({
            description: `Error updating daily schedule (guard cell): ${error instanceof Error ? error.message : String(error)}`,
            schoolId: school.id,
            metadata: { columnId, id },
        });
        return {
            success: false,
            message: messages.common.serverError,
        };
    }
}
