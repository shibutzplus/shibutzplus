"use server";

import { db, schema } from "@/db";
import { AnnualScheduleType, AnnualScheduleRequest } from "@/models/types/annualSchedule";
import { ActionResponse } from "@/models/types/actions";
import { checkAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { NewAnnualScheduleSchema } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function updateAnnualScheduleAction(
    id: string,
    scheduleData: AnnualScheduleRequest,
): Promise<ActionResponse & { data?: AnnualScheduleType }> {
    try {
        const { school, class: classData, teacher, subject } = scheduleData;

        const authError = await checkAuthAndParams({
            id,
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

        const updatedEntry = await db
            .update(schema.annualSchedule)
            .set({
                day: scheduleData.day,
                hour: scheduleData.hour,
                position,
                schoolId: school.id,
                classId: classData.id,
                teacherId: teacher.id,
                subjectId: subject.id,
            } as Partial<NewAnnualScheduleSchema>)
            .where(eq(schema.annualSchedule.id, id))
            .returning();

        if (!updatedEntry[0]) {
            return {
                success: false,
                message: messages.annualSchedule.updateError,
            };
        }

        const updateSchedule = updatedEntry[0];
        return {
            success: true,
            message: messages.annualSchedule.updateSuccess,
            data: {
                id: updateSchedule.id,
                day: updateSchedule.day,
                hour: updateSchedule.hour,
                position: updateSchedule.position,
                createdAt: updateSchedule.createdAt,
                updatedAt: updateSchedule.updatedAt,
                class: classData,
                school,
                teacher,
                subject,
            } as AnnualScheduleType,
        };
    } catch (error) {
        console.error("Error updating annual schedule entry:", error);
        return {
            success: false,
            message: messages.annualSchedule.updateError,
        };
    }
}
