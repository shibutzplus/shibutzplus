"use server";

import { DailyScheduleType, DailyScheduleRequest } from "@/models/types/dailySchedule";
import { checkAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { eq } from "drizzle-orm";
import { db, schema } from "../../db";
import { ActionResponse } from "@/models/types/actions";
import { NewDailyScheduleSchema } from "@/db/schema";

export async function updateDailyScheduleAction(
    id: string,
    scheduleData: DailyScheduleRequest,
): Promise<ActionResponse & { data?: DailyScheduleType }> {
    try {
        const {
            school,
            class: classData,
            subject,
            absentTeacher,
            presentTeacher,
            subTeacher,
        } = scheduleData;

        const authError = await checkAuthAndParams({
            id,
            date: scheduleData.date,
            hour: scheduleData.hour,
            schoolId: school.id,
            classId: classData.id,
            subjectId: subject.id,
        });
        if (authError) {
            return authError as ActionResponse;
        }

        // Generate the position string (e.g., "date2025-06-28-hour3")
        const position = `date${scheduleData.date.split("T")[0]}-hour${scheduleData.hour}`;

        const updatedEntry = await db
            .update(schema.dailySchedule)
            .set({
                date: scheduleData.date,
                hour: scheduleData.hour,
                position,
                schoolId: school.id,
                classId: classData.id,
                subjectId: subject.id,
                absentTeacherId: absentTeacher?.id,
                presentTeacherId: presentTeacher?.id,
                subTeacherId: subTeacher?.id,
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
                date: new Date(updateSchedule.date),
                hour: updateSchedule.hour,
                position: updateSchedule.position,
                createdAt: updateSchedule.createdAt,
                updatedAt: updateSchedule.updatedAt,
                class: classData,
                school,
                subject,
                absentTeacher,
                presentTeacher,
                subTeacher,
            } as DailyScheduleType,
        };
    } catch (error) {
        console.error("Error updating daily schedule:", error);
        return {
            success: false,
            message: messages.dailySchedule.updateError,
        };
    }
}
