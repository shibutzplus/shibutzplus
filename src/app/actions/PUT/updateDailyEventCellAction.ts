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

export async function updateDailyEventCellAction(
    id: string,
    scheduleData: DailyScheduleRequest,
): Promise<ActionResponse & { data?: DailyScheduleType }> {
    const { date, day, hour, columnId, school, eventTitle, event, position } = scheduleData;
    try {

        const authError = await checkAuthAndParams({
            id,
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

        const updatedEntry = await executeQuery(async () => {
            return await db
                .update(schema.dailySchedule)
                .set({
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
                    event: event,
                    position: position,
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
        return {
            success: true,
            message: messages.annualSchedule.updateSuccess,
            data: {
                id: updateSchedule.id,
                date: getStringReturnDate(updateSchedule.date),
                day: updateSchedule.day,
                hour: updateSchedule.hour,
                columnId: updateSchedule.columnId,
                createdAt: updateSchedule.createdAt,
                updatedAt: updateSchedule.updatedAt,
                school,
                originalTeacher: undefined,
                columnType: ColumnTypeValues.event,
                subTeacher: undefined,
                subject: undefined,
                eventTitle,
                event,
                position,
            } as DailyScheduleType,
        };
    } catch (error) {
        dbLog({
            description: `Error updating daily schedule (event cell): ${error instanceof Error ? error.message : String(error)}`,
            schoolId: school.id,
            metadata: { columnId, id }
        });
        return {
            success: false,
            message: messages.common.serverError,
        };
    }
}
