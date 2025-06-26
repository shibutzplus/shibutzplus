"use server";

import { db, schema } from "@/db";
import { AnnualScheduleType, AnnualScheduleRequest } from "@/models/types/annualSchedule";
import { ActionResponse } from "@/models/types/actions";
import { checkAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { NewAnnualScheduleSchema } from "@/db/schema";

export async function addAnnualScheduleAction(
    scheduleData: AnnualScheduleRequest,
): Promise<ActionResponse & { data?: AnnualScheduleType }> {
    try {
        const { school, class: classData, teacher, subject } = scheduleData;
        const authError = await checkAuthAndParams({
            day: scheduleData.day,
            hour: scheduleData.hour,
            schoolId: school.id,
            classId: classData.id,
            teacherId: teacher.id,
            subjectId: subject.id,
        });

        if (authError) {
            return authError as ActionResponse;
        }

        // Generate the position string (e.g., "day2-hour3")
        const position = `day${scheduleData.day}-hour${scheduleData.hour}`;

        const newRow: NewAnnualScheduleSchema = {
            day: scheduleData.day,
            hour: scheduleData.hour,
            position,
            schoolId: school.id,
            classId: classData.id,
            teacherId: teacher.id,
            subjectId: subject.id,
        };

        const newScheduleEntry = (
            await db.insert(schema.annualSchedule).values(newRow).returning()
        )[0];

        if (!newScheduleEntry) {
            return {
                success: false,
                message: messages.annualSchedule.createError,
            };
        }

        return {
            success: true,
            message: messages.annualSchedule.createSuccess,
            data: {
                id: newScheduleEntry.id,
                day: newScheduleEntry.day,
                hour: newScheduleEntry.hour,
                position: newScheduleEntry.position,
                createdAt: newScheduleEntry.createdAt,
                updatedAt: newScheduleEntry.updatedAt,
                class: classData,
                school,
                teacher,
                subject,
            } as AnnualScheduleType,
        };
    } catch (error) {
        console.error("Error creating annual schedule entry:", error);
        return {
            success: false,
            message: messages.annualSchedule.createError,
        };
    }
}
