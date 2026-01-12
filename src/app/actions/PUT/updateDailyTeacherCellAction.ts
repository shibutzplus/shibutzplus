"use server";

import { DailyScheduleType, DailyScheduleRequest } from "@/models/types/dailySchedule";
import { publicAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { eq } from "drizzle-orm";
import { db, schema, executeQuery } from "../../../db";
import { ActionResponse } from "@/models/types/actions";
import { NewDailyScheduleSchema } from "@/db/schema";
import { getDateReturnString, getStringReturnDate } from "@/utils/time";

export async function updateDailyTeacherCellAction(
    id: string,
    scheduleData: DailyScheduleRequest,
): Promise<ActionResponse & { data?: DailyScheduleType }> {
    try {
        const {
            school,
            classes,
            subject,
            originalTeacher,
            columnType,
            subTeacher,
            eventTitle,
            event,
            position,
            instructions,
            dayInt,
            date,
            hour,
            columnId,
        } = scheduleData;

        const authError = await publicAuthAndParams({
            id,
            date: date,
            dayInt: dayInt,
            hour: hour,
            columnId: columnId,
            schoolId: school.id,
            classesIds: classes?.map((c) => c.id),
            subjectId: subject?.id,
        });
        if (authError || !subject) {
            return authError as ActionResponse;
        }

        // Build update payload (minimal change: handle instructions conditionally)
        const updateData: Partial<NewDailyScheduleSchema> = {
            date: getDateReturnString(scheduleData.date),
            dayInt: dayInt,
            hour: scheduleData.hour,
            columnId: scheduleData.columnId,
            schoolId: school.id,
            classIds: classes?.map((c) => c.id),
            subjectId: subject.id,
            originalTeacherId: originalTeacher?.id,
            columnType: columnType,
            subTeacherId: subTeacher?.id || null,
            eventTitle: eventTitle,
            event: event || null,
            position: position,
        };

        // Only update instructions if it was provided; otherwise leave DB value as-is
        if (instructions !== undefined) {
            updateData.instructions =
                typeof instructions === "string" && instructions.trim() === "" ? null : instructions;
        }

        const updatedEntry = await executeQuery(async () => {
            return await db
                .update(schema.dailySchedule)
                .set(updateData)
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
                dayInt: updateSchedule.dayInt,
                hour: updateSchedule.hour,
                columnId: updateSchedule.columnId,
                createdAt: updateSchedule.createdAt,
                updatedAt: updateSchedule.updatedAt,
                classes,
                school,
                subject,
                originalTeacher,
                columnType,
                subTeacher,
                eventTitle,
                event,
                position,
                instructions: updateSchedule.instructions,
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
