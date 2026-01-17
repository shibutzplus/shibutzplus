"use server";

import { ActionResponse } from "@/models/types/actions";
import { AnnualScheduleType } from "@/models/types/annualSchedule";
import { checkAuthAndParams, checkIsNotGuest } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { db, schema, executeQuery } from "@/db";
import { and, eq, asc } from "drizzle-orm";
import { TeacherType } from "@/models/types/teachers";

export async function deleteTeacherAction(
    schoolId: string,
    teacherId: string,
): Promise<ActionResponse & { annualSchedules?: AnnualScheduleType[]; teachers?: TeacherType[] }> {
    try {
        const authError = await checkAuthAndParams({ schoolId, teacherId });
        if (authError) {
            return authError as ActionResponse;
        }

        const guestError = await checkIsNotGuest();
        if (guestError) {
            return guestError as ActionResponse;
        }

        const { annualSchedule, remainingTeachers } = await executeQuery(async () => {
            // Delete the teacher
            await db
                .delete(schema.teachers)
                .where(
                    and(eq(schema.teachers.schoolId, schoolId), eq(schema.teachers.id, teacherId)),
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

            // Get the remaining teachers for this school
            const remainingTeachers = await db
                .select()
                .from(schema.teachers)
                .where(eq(schema.teachers.schoolId, schoolId))
                .orderBy(asc(schema.teachers.name));

            return { annualSchedule, remainingTeachers };
        });

        return {
            success: true,
            message: messages.teachers.deleteSuccess,
            annualSchedules: annualSchedule,
            teachers: remainingTeachers,
        };
    } catch (error) {
        console.error("Error deleting teacher:", error);
        return {
            success: false,
            message: messages.teachers.deleteError,
        };
    }
}
