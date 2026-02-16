"use server";

import { db } from "@/db";
import { annualSchedule, teachers } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { dbLog } from "@/services/loggerService";

/**
 * Check if a teacher already has a schedule in the annual_schedule table
 * Returns true if the teacher has at least one schedule entry
 */
export async function checkTeacherHasScheduleAction(
    teacherName: string,
    schoolId: string
): Promise<boolean> {
    try {
        // First, get the teacher ID by name and schoolId
        const teacher = await db.query.teachers.findFirst({
            where: and(
                eq(teachers.name, teacherName),
                eq(teachers.schoolId, schoolId)
            ),
            columns: {
                id: true
            }
        });

        if (!teacher) {
            // Teacher doesn't exist in DB, so no schedule
            return false;
        }

        // Check if teacher has any schedule entries
        const scheduleCount = await db
            .select({ count: annualSchedule.id })
            .from(annualSchedule)
            .where(
                and(
                    eq(annualSchedule.teacherId, teacher.id),
                    eq(annualSchedule.schoolId, schoolId)
                )
            )
            .limit(1);

        return scheduleCount.length > 0;
    } catch (error) {
        dbLog({ description: `Error checking teacher schedule: ${error instanceof Error ? error.message : String(error)}`, schoolId, user: "Unknown" });
        return false;
    }
}
