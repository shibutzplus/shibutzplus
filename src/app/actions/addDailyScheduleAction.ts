"use server";

import { DailyScheduleType, DailyScheduleRequest } from "@/models/types/dailySchedule";
import { checkAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { db, schema } from "../../db";
import { ActionResponse } from "@/models/types/actions";
import { NewDailyScheduleSchema } from "@/db/schema";

export async function addDailyScheduleAction(
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
            date: scheduleData.date,
            hour: scheduleData.hour,
            schoolId: school.id,
            classId: classData.id,
            subjectId: subject.id,
        });
        if (authError) {
            return authError as ActionResponse;
        }

        // Create the daily schedule entry
        // Format date as YYYY-MM-DD string for database compatibility
        const position = `date${scheduleData.date.split("T")[0]}-hour${scheduleData.hour}`;

        const newRow: NewDailyScheduleSchema = {
            date: scheduleData.date,
            hour: scheduleData.hour,
            position,
            schoolId: school.id,
            classId: classData.id,
            subjectId: subject.id,
            absentTeacherId: absentTeacher?.id,
            presentTeacherId: presentTeacher?.id,
            subTeacherId: subTeacher?.id,
        };

        const newDailySchedule = (
            await db.insert(schema.dailySchedule).values(newRow).returning()
        )[0];

        if (!newDailySchedule) {
            return {
                success: false,
                message: messages.dailySchedule.createError,
            };
        }

        return {
            success: true,
            message: messages.dailySchedule.createSuccess,
            data: {
                id: newDailySchedule.id,
                date: new Date(newDailySchedule.date),
                hour: newDailySchedule.hour,
                position: newDailySchedule.position,
                createdAt: newDailySchedule.createdAt,
                updatedAt: newDailySchedule.updatedAt,
                class: classData,
                school,
                absentTeacher,
                presentTeacher,
                subTeacher,
                subject,
            } as DailyScheduleType,
        };
    } catch (error) {
        console.error("Error creating daily schedule entry:", error);
        return {
            success: false,
            message: messages.dailySchedule.createError,
        };
    }
}
