"use server";

import { ActionResponse } from "@/models/types/actions";
import { AnnualScheduleType } from "@/models/types/annualSchedule";
import { checkAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { db, schema } from "@/db";
import { and, eq } from "drizzle-orm";
import { ClassType } from "@/models/types/classes";

export async function deleteClassAction(
    schoolId: string,
    classId: string,
): Promise<ActionResponse & { classes?: ClassType[]; annualSchedules?: AnnualScheduleType[] }> {
    try {
        const authError = await checkAuthAndParams({ schoolId, classId });
        if (authError) {
            return authError as ActionResponse;
        }

        // Delete all annual schedule records for this class
        await db
            .delete(schema.annualSchedule)
            .where(
                and(
                    eq(schema.annualSchedule.schoolId, schoolId),
                    eq(schema.annualSchedule.classId, classId),
                ),
            );

        const schedules = await db.query.annualSchedule.findMany({
            where: eq(schema.annualSchedule.schoolId, schoolId),
            with: {
                school: true,
                class: true,
                teacher: true,
                subject: true,
            },
        });

        const annualSchedule = schedules.map(
            (schedule: any) =>
                ({
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
                }) as AnnualScheduleType,
        );

        // Delete the class
        await db
            .delete(schema.classes)
            .where(and(eq(schema.classes.schoolId, schoolId), eq(schema.classes.id, classId)));

        // Get the remaining classes for this school
        const remainingClasses = await db
            .select()
            .from(schema.classes)
            .where(eq(schema.classes.schoolId, schoolId));

        return {
            success: true,
            message: messages.classes.deleteSuccess,
            annualSchedules: annualSchedule,
            classes: remainingClasses,
        };
    } catch (error) {
        console.error("Error deleting class:", error);
        return {
            success: false,
            message: messages.classes.deleteError,
        };
    }
}
