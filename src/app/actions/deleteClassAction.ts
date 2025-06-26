"use server";

import { ActionResponse } from "@/models/types/actions";
import { AnnualScheduleType } from "@/models/types/annualSchedule";
import { checkAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { db, schema } from "@/db";
import { and, eq } from "drizzle-orm";

export type DeleteClassResponse = ActionResponse & {
    deletedAnnualSchedules?: AnnualScheduleType[];
};

export async function deleteClassAction(
    schoolId: string,
    classId: string
): Promise<DeleteClassResponse> {
    try {
        const authError = await checkAuthAndParams({ schoolId, classId });
        if (authError) {
            return authError as DeleteClassResponse;
        }

        // Get all annual schedule records related to this class
        const annualSchedules = await db.query.annualSchedule.findMany({
            where: and(
                eq(schema.annualSchedule.schoolId, schoolId),
                eq(schema.annualSchedule.classId, classId)
            ),
            with: {
                school: true,
                class: true,
                teacher: true,
                subject: true,
            },
        });

        const formattedAnnualSchedules = annualSchedules.map(
            (schedule: any) => ({
                id: schedule.id,
                day: schedule.day,
                hour: schedule.hour,
                position: schedule.position,
                school: schedule.school,
                class: schedule.class,
                teacher: schedule.teacher,
                subject: schedule.subject,
                createdAt: schedule.createdAt,
                updatedAt: schedule.updatedAt,
            }) as AnnualScheduleType
        );

        // Delete all annual schedule records for this class
        await db.delete(schema.annualSchedule)
            .where(
                and(
                    eq(schema.annualSchedule.schoolId, schoolId),
                    eq(schema.annualSchedule.classId, classId)
                )
            );

        // Delete the class
        await db.delete(schema.classes)
            .where(
                and(
                    eq(schema.classes.schoolId, schoolId),
                    eq(schema.classes.id, classId)
                )
            );

        return {
            success: true,
            message: messages.classes.deleteSuccess,
            deletedAnnualSchedules: formattedAnnualSchedules,
        };
    } catch (error) {
        console.error("Error deleting class:", error);
        return {
            success: false,
            message: messages.classes.deleteError,
        };
    }
}
