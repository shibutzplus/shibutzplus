"use server";

import { ActionResponse } from "@/models/types/actions";
import { AnnualScheduleType } from "@/models/types/annualSchedule";
import { checkAuthAndParams, checkIsNotGuest } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { db, schema, executeQuery } from "@/db";
import { and, eq, asc } from "drizzle-orm";
import { TeacherType } from "@/models/types/teachers";
import { dbLog } from "@/services/loggerService";
import { pushSyncUpdateServer } from "@/services/sync/serverSyncService";
import { ENTITIES_DATA_CHANGED } from "@/models/constant/sync";
import { revalidateTag } from "next/cache";
import { cacheTags } from "@/lib/cacheTags";
import { clearAnnualScheduleCache } from "@/services/schedule/getAnnualSchedule";
import { getTeacherUsageCount } from "@/services/entities/entityUsageService";

export async function deleteTeacherAction(
    schoolId: string,
    teacherId: string,
    force: boolean = false,
): Promise<ActionResponse & { annualSchedules?: AnnualScheduleType[]; teachers?: TeacherType[]; usageCount?: number }> {
    try {
        const authError = await checkAuthAndParams({ schoolId, teacherId });
        if (authError) {
            return authError as ActionResponse;
        }

        const guestError = await checkIsNotGuest();
        if (guestError) {
            return guestError as ActionResponse;
        }

        const usage = await getTeacherUsageCount(schoolId, teacherId);
        if (usage.totalCount > 0 && !force) {
            return {
                success: false,
                message: `המורה משובץ/ת ב-${usage.totalCount} שיעורים במערכת.`,
                usageCount: usage.totalCount,
            };
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
                .where(and(eq(schema.teachers.schoolId, schoolId), eq(schema.teachers.isActive, true)))
                .orderBy(asc(schema.teachers.name));

            return { annualSchedule, remainingTeachers };
        });

        // Invalidate cache - teacher deletion affects schedules AND lists
        clearAnnualScheduleCache(schoolId);
        revalidateTag(cacheTags.teachersList(schoolId));

        void pushSyncUpdateServer(ENTITIES_DATA_CHANGED, { schoolId });

        return {
            success: true,
            message: messages.teachers.deleteSuccess,
            annualSchedules: annualSchedule,
            teachers: remainingTeachers,
        };
    } catch (error) {
        dbLog({
            description: `Error deleting teacher: ${error instanceof Error ? error.message : String(error)}`,
            schoolId,
            metadata: { teacherId }
        });
        return {
            success: false,
            message: messages.teachers.deleteError,
        };
    }
}
