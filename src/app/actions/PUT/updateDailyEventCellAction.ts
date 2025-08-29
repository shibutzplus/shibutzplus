"use server";

import { DailyScheduleType, DailyScheduleRequest } from "@/models/types/dailySchedule";
import { checkAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { eq } from "drizzle-orm";
import { db, schema } from "../../../db";
import { ActionResponse } from "@/models/types/actions";
import { NewDailyScheduleSchema } from "@/db/schema";
import { getDateReturnString, getStringReturnDate } from "@/utils/time";

export async function updateDailyEventCellAction(
    id: string,
    scheduleData: DailyScheduleRequest,
): Promise<ActionResponse & { data?: DailyScheduleType }> {
    try {
        const {
            date,
            day,
            hour,
            columnId,
            school,
            eventTitle,
            event,
            position
        } = scheduleData;

        const authError = await checkAuthAndParams({
            id,
            date: date,
            day: day,
            hour: hour,
            columnId: columnId,
            schoolId: school.id,
            eventTitle: eventTitle,
            event: event,
            position: position
        });
        if (authError) {
            return authError as ActionResponse;
        }

        const updatedEntry = await db
            .update(schema.dailySchedule)
            .set({
                date: getDateReturnString(date),
                day: day,
                hour: hour,
                columnId: columnId,
                schoolId: school.id,
                classId: null,
                subjectId: null,
                issueTeacherId: null,
                issueTeacherType: "event",
                subTeacherId: null,
                eventTitle: eventTitle,
                event: event,
                position: position,
            } as Partial<NewDailyScheduleSchema>)
            .where(eq(schema.dailySchedule.id, id))
            .returning();

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
                class: undefined,
                issueTeacher: undefined,
                issueTeacherType: "event",
                subTeacher: undefined,
                subject: undefined,
                eventTitle,
                event,
                position,
            } as DailyScheduleType,
        };
    } catch (error) {
        console.error("Error updating daily schedule:", error);
        return {
            success: false,
            message: messages.common.serverError,
        };
    }
}
