"use server";

import { ColumnTypeValues, DailyScheduleType, DailyScheduleRequest } from "@/models/types/dailySchedule";
import { ActionResponse } from "@/models/types/actions";
import { checkAuthAndParams } from "@/utils/authUtils";
import { getDateReturnString } from "@/utils/time";
import messages from "@/resources/messages";
import { db, schema, executeQuery } from "../../../db";
import { NewDailyScheduleSchema } from "@/db/schema";
import { dbLog } from "@/services/loggerService";
import { pushSyncUpdateServer } from "@/services/sync/serverSyncService";
import { DAILY_EVENT_COL_DATA_CHANGED } from "@/models/constant/sync";
import { revalidateTag } from "next/cache";
import { cacheTags } from "@/lib/cacheTags";

export async function addDailyGuardCellAction(
    scheduleCellData: DailyScheduleRequest,
): Promise<ActionResponse & { data?: DailyScheduleType }> {
    try {
        const { date, day, hour, columnId, school, position } = scheduleCellData;

        const authError = await checkAuthAndParams({
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

        const newRow: NewDailyScheduleSchema = {
            date: getDateReturnString(date),
            day,
            hour,
            columnId,
            schoolId: school.id,
            columnType: ColumnTypeValues.guard,
            position,
            eventTitle: scheduleCellData.eventTitle ?? null,
            event: scheduleCellData.event ?? null,
            guardTeacherIds: scheduleCellData.guardTeacherIds ?? null,
            instructions: scheduleCellData.instructions ?? null,
        };

        const newDailySchedule = await executeQuery(async () => {
            return (await db.insert(schema.dailySchedule).values(newRow).returning())[0];
        });

        if (!newDailySchedule) {
            return {
                success: false,
                message: messages.dailySchedule.createError,
            };
        }

        revalidateTag(cacheTags.schoolSchedule(school.id));
        revalidateTag(cacheTags.dailySchedule(school.id, getDateReturnString(date)));
        await pushSyncUpdateServer(DAILY_EVENT_COL_DATA_CHANGED, { schoolId: school.id, date: getDateReturnString(date) });

        return {
            success: true,
            message: messages.dailySchedule.createSuccess,
            data: {
                id: newDailySchedule.id,
                date: new Date(newDailySchedule.date),
                day: newDailySchedule.day!,
                hour: newDailySchedule.hour,
                columnId: newDailySchedule.columnId,
                createdAt: newDailySchedule.createdAt,
                updatedAt: newDailySchedule.updatedAt,
                school,
                columnType: ColumnTypeValues.guard,
                position,
                eventTitle: newDailySchedule.eventTitle ?? undefined,
                event: newDailySchedule.event ?? undefined,
                guardTeacherIds: newDailySchedule.guardTeacherIds ?? undefined,
                instructions: newDailySchedule.instructions ?? undefined,
            } as DailyScheduleType,
        };
    } catch (error) {
        dbLog({
            description: `Error creating daily guard schedule entry: ${error instanceof Error ? error.message : String(error)}`,
            schoolId: scheduleCellData.school.id,
        });
        return {
            success: false,
            message: messages.common.serverError,
        };
    }
}
