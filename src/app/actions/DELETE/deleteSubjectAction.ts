"use server";

import { ActionResponse } from "@/models/types/actions";
import { AnnualScheduleType } from "@/models/types/annualSchedule";
import { checkAuthAndParams, checkIsNotGuest } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { db, schema, executeQuery } from "@/db";
import { and, eq, asc } from "drizzle-orm";
import { SubjectType } from "@/models/types/subjects";
import { dbLog } from "@/services/loggerService";
import { pushSyncUpdateServer } from "@/services/sync/serverSyncService";
import { ENTITIES_DATA_CHANGED } from "@/models/constant/sync";
import { revalidateTag } from "next/cache";
import { cacheTags } from "@/lib/cacheTags";
import { clearAnnualScheduleCache } from "@/services/schedule/getAnnualSchedule";
import { getSubjectUsageCount } from "@/services/entities/entityUsageService";

export async function deleteSubjectAction(
    schoolId: string,
    subjectId: string,
    force: boolean = false,
): Promise<ActionResponse & { annualSchedules?: AnnualScheduleType[]; subjects?: SubjectType[]; usageCount?: number }> {
    try {
        const authError = await checkAuthAndParams({ schoolId, subjectId });
        if (authError) {
            return authError as ActionResponse;
        }

        const guestError = await checkIsNotGuest();
        if (guestError) {
            return guestError as ActionResponse;
        }

        const usage = await getSubjectUsageCount(schoolId, subjectId);
        if (usage.totalCount > 0 && !force) {
            return {
                success: false,
                message: `המקצוע משובץ ב-${usage.totalCount} שיעורים במערכת.`,
                usageCount: usage.totalCount,
            };
        }

        const { annualSchedule, remainingSubjects } = await executeQuery(async () => {
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

        // Invalidate cache - subject deletion affects schedules AND lists
        clearAnnualScheduleCache(schoolId);
        revalidateTag(cacheTags.subjectsList(schoolId));

        void pushSyncUpdateServer(ENTITIES_DATA_CHANGED, { schoolId });

        return {
            success: true,
            message: messages.subjects.deleteSuccess,
            annualSchedules: annualSchedule,
            subjects: remainingSubjects,
        };
    } catch (error) {
        dbLog({
            description: `Error deleting subject: ${error instanceof Error ? error.message : String(error)}`,
            schoolId,
            metadata: { subjectId }
        });
        return {
            success: false,
            message: messages.subjects.deleteError,
        };
    }
}
