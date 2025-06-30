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
            date,
            hour,
            school,
            class: classData,
            subject,
            absentTeacher,
            presentTeacher,
            subTeacher,
        } = scheduleData;

        const authError = await checkAuthAndParams({
            date: date,
            hour: hour,
            schoolId: school.id,
            classId: classData.id,
            subjectId: subject.id,
        });
        if (authError) {
            return authError as ActionResponse;
        }

        const newRow: NewDailyScheduleSchema = {
            date: date,
            hour: hour,
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
                date: newDailySchedule.date,
                hour: newDailySchedule.hour,
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
