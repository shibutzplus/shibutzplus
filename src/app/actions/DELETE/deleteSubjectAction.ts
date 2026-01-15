"use server";

import { ActionResponse } from "@/models/types/actions";
import { AnnualScheduleType } from "@/models/types/annualSchedule";
import { checkAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { db, schema, executeQuery } from "@/db";
import { and, eq, asc } from "drizzle-orm";
import { SubjectType } from "@/models/types/subjects";

export async function deleteSubjectAction(
    schoolId: string,
    subjectId: string,
): Promise<ActionResponse & { annualSchedules?: AnnualScheduleType[]; subjects?: SubjectType[] }> {
    try {
        const authError = await checkAuthAndParams({ schoolId, subjectId });
        if (authError) {
            return authError as ActionResponse;
        }

        const { annualSchedule, remainingSubjects } = await executeQuery(async () => {
            // Delete all daily schedule records for this class
            await db
                .delete(schema.dailySchedule)
                .where(
                    and(
                        eq(schema.dailySchedule.schoolId, schoolId),
                        eq(schema.dailySchedule.subjectId, subjectId),
                    ),
                );

            // Delete the subject
            await db
                .delete(schema.subjects)
                .where(
                    and(eq(schema.subjects.schoolId, schoolId), eq(schema.subjects.id, subjectId)),
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
                        school: schedule.school,
                        class: schedule.class,
                        teacher: schedule.teacher,
                        subject: schedule.subject,
                        createdAt: schedule.createdAt,
                        updatedAt: schedule.updatedAt,
                    }) as AnnualScheduleType,
            );

            // Get the remaining subjects for this school
            const remainingSubjects = await db
                .select()
                .from(schema.subjects)
                .where(eq(schema.subjects.schoolId, schoolId))
                .orderBy(asc(schema.subjects.name));

            return { annualSchedule, remainingSubjects };
        });

        return {
            success: true,
            message: messages.subjects.deleteSuccess,
            annualSchedules: annualSchedule,
            subjects: remainingSubjects,
        };
    } catch (error) {
        console.error("Error deleting subject:", error);
        return {
            success: false,
            message: messages.subjects.deleteError,
        };
    }
}
