"use server";

import { db, schema, executeQuery } from "@/db";
import { AnnualScheduleType, AnnualScheduleRequest } from "@/models/types/annualSchedule";
import { ActionResponse } from "@/models/types/actions";
import { revalidateTag } from "next/cache";
import { cacheTags } from "@/lib/cacheTags";
import { checkAuthAndParams, checkIsNotGuest } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { NewAnnualScheduleSchema } from "@/db/schema";
import { dbLog } from "@/services/loggerService";

export async function addAnnualScheduleAction(
    scheduleData: AnnualScheduleRequest,
): Promise<ActionResponse & { data?: AnnualScheduleType }> {
    const { school, class: classData, teacher, subject } = scheduleData;
    try {
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

        const guestError = await checkIsNotGuest();
        if (guestError) {
            return guestError as ActionResponse;
        }

        const newRow: NewAnnualScheduleSchema = {
            day: scheduleData.day,
            hour: scheduleData.hour,
            schoolId: school.id,
            classId: classData.id,
            teacherId: teacher.id,
            subjectId: subject.id,
        };

        const newScheduleEntry = await executeQuery(async () => {
            return (await db.insert(schema.annualSchedule).values(newRow).returning())[0];
        });

        if (!newScheduleEntry) {
            return {
                success: false,
                message: messages.annualSchedule.createError,
            };
        }

        // Clear Cache for all teachers in this school - Annual schedule
        revalidateTag(cacheTags.schoolSchedule(school.id));

        return {
            success: true,
            message: messages.annualSchedule.createSuccess,
            data: {
                id: newScheduleEntry.id,
                day: newScheduleEntry.day,
                hour: newScheduleEntry.hour,
                createdAt: newScheduleEntry.createdAt,
                updatedAt: newScheduleEntry.updatedAt,
                class: classData,
                school,
                teacher,
                subject,
            } as AnnualScheduleType,
        };
    } catch (error) {
        dbLog({
            description: `Error creating annual schedule entry: ${error instanceof Error ? error.message : String(error)}`,
            schoolId: school.id,
            user: teacher.id,
            metadata: { day: scheduleData.day, hour: scheduleData.hour, classId: classData.id, subjectId: subject.id }
        });
        return {
            success: false,
            message: messages.common.serverError,
        };
    }
}
