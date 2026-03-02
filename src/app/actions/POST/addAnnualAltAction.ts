"use server";

import { db, schema, executeQuery } from "@/db";
import { AnnualScheduleType, AnnualScheduleRequest } from "@/models/types/annualSchedule";
import { ActionResponse } from "@/models/types/actions";
import { checkAuthAndParams, checkIsNotGuest } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { NewAnnualScheduleAltSchema } from "@/db/schema";
import { dbLog } from "@/services/loggerService";

export const addAnnualAltAction = async (
    newScheduleItem: AnnualScheduleRequest,
): Promise<ActionResponse & { data?: AnnualScheduleType }> => {
    const { school, class: classData, teacher, subject } = newScheduleItem;
    try {
        const authError = await checkAuthAndParams({
            day: newScheduleItem.day,
            hour: newScheduleItem.hour,
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

        const newRow: NewAnnualScheduleAltSchema = {
            day: newScheduleItem.day,
            hour: newScheduleItem.hour,
            schoolId: school.id,
            classId: classData.id,
            teacherId: teacher.id,
            subjectId: subject.id,
        };

        const newScheduleEntry = await executeQuery(async () => {
            return (await db.insert(schema.annualScheduleAlt).values(newRow).returning())[0];
        });

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
            description: `Error creating alt schedule entry: ${error instanceof Error ? error.message : String(error)}`,
            schoolId: school.id,
            user: teacher.id,
            metadata: { day: newScheduleItem.day, hour: newScheduleItem.hour, classId: classData.id, subjectId: subject.id }
        });
        return {
            success: false,
            message: messages.common.serverError,
        };
    }
}
