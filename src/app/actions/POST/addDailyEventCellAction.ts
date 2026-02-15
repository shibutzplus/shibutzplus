"use server";

import { ColumnTypeValues, DailyScheduleType, DailyScheduleRequest } from "@/models/types/dailySchedule";
import { ActionResponse } from "@/models/types/actions";
import { eventPlaceholder } from "@/models/constant/table";
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

export async function addDailyEventCellAction(
    scheduleCellData: DailyScheduleRequest,
): Promise<ActionResponse & { data?: DailyScheduleType }> {
    try {
        const { date, day, hour, columnId, school, eventTitle, event, position } = scheduleCellData;

        const authError = await checkAuthAndParams({
            date: date,
            day: day,
            hour: hour,
            columnId: columnId,
            schoolId: school.id,
            eventTitle: eventTitle,
            event: event,
            position: position,
        });
        if (authError) {
            return authError as ActionResponse;
        }

        const resEvent = event === eventPlaceholder ? "" : event;
        const newRow: NewDailyScheduleSchema = {
            date: getDateReturnString(date),
            day: day,
            hour: hour,
            columnId: columnId,
            schoolId: school.id,
            classIds: null,
            subjectId: null,
            originalTeacherId: null,
            columnType: ColumnTypeValues.event,
            subTeacherId: null,
            eventTitle: eventTitle,
            event: resEvent,
            position: position,
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
        void pushSyncUpdateServer(DAILY_EVENT_COL_DATA_CHANGED, { schoolId: school.id, date: getDateReturnString(date) });

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
                class: undefined,
                originalTeacher: undefined,
                columnType: ColumnTypeValues.event,
                subTeacher: undefined,
                subject: undefined,
                eventTitle,
                event: resEvent,
                position,
            } as DailyScheduleType,
        };
    } catch (error) {
        dbLog({ description: `Error creating daily schedule entry: ${error instanceof Error ? error.message : String(error)}`, schoolId: scheduleCellData.school.id });
        return {
            success: false,
            message: messages.common.serverError,
        };
    }
}
