
import { db } from '@/db';
import { history, dailySchedule, teachers, classes, subjects, schools } from '@/db/schema';
import { eq, inArray, and, lte } from 'drizzle-orm';
import { DAILY_KEEP_HISTORY_DAYS } from "@/utils/time";
import { dbLog } from "@/services/loggerService";

interface HistoryUpdateResult {
    success: boolean;
    logs: string[];
    schoolsUpdated: number;
    recordsCount: number;
}

export async function processHistoryUpdate(dateString?: string): Promise<HistoryUpdateResult> {
    const targetDate = dateString || new Date().toISOString().split('T')[0];
    let targetSchoolIds: string[] = [];

    try {
        // 2. Find ALL schools (regardless of publish status)
        const schoolsQuery = db
            .select({ id: schools.id, name: schools.name })
            .from(schools);

        const targetSchools = await schoolsQuery;

        if (targetSchools.length === 0) {
            return { success: true, logs: [], schoolsUpdated: 0, recordsCount: 0 };
        }

        targetSchoolIds = targetSchools.map(s => s.id);

        // 3. Fetch daily schedules
        const schedules = await db
            .select()
            .from(dailySchedule)
            .where(
                and(
                    eq(dailySchedule.date, targetDate),
                    inArray(dailySchedule.schoolId, targetSchoolIds)
                )
            );

        if (schedules.length === 0) {
            return { success: true, logs: [], schoolsUpdated: targetSchoolIds.length, recordsCount: 0 };
        }

        // 4. Fetch reference data
        const allTeachers = await db.select({ id: teachers.id, name: teachers.name }).from(teachers);
        const allSubjects = await db.select({ id: subjects.id, name: subjects.name }).from(subjects);
        const allClasses = await db.select({ id: classes.id, name: classes.name }).from(classes);

        const teacherMap = new Map(allTeachers.map(t => [t.id, t.name]));
        const subjectMap = new Map(allSubjects.map(s => [s.id, s.name]));
        const classMap = new Map(allClasses.map(c => [c.id, c.name]));

        const historyRecords = schedules.map(schedule => {
            const getTeacherName = (id: string | null) => id ? teacherMap.get(id) || null : null;
            const getSubjectName = (id: string | null) => id ? subjectMap.get(id) || null : null;

            const classNames = schedule.classIds
                ? schedule.classIds.map(id => classMap.get(id)).filter((name): name is string => !!name)
                : null;

            const columnType = schedule.columnType;
            const day = schedule.day || 0;

            return {
                schoolId: schedule.schoolId,
                date: schedule.date,
                day: day,
                hour: schedule.hour,
                columnId: schedule.columnId || '',
                columnPosition: schedule.position,
                columnType: columnType,
                originalTeacher: getTeacherName(schedule.originalTeacherId),
                classes: classNames ? classNames.join(', ') : null,
                subject: getSubjectName(schedule.subjectId),
                subTeacher: getTeacherName(schedule.subTeacherId),
                instructions: schedule.instructions,
                eventTitle: schedule.eventTitle,
                eventText: schedule.event,
            };
        });

        if (historyRecords.length > 0) {
            // 5. Run DB operations in a transaction for atomicity
            await db.transaction(async (tx) => {
                // Delete existing records to prevent duplicates for this day/schools
                await tx.delete(history)
                    .where(
                        and(
                            eq(history.date, targetDate),
                            inArray(history.schoolId, targetSchoolIds)
                        )
                    );

                await tx.insert(history).values(historyRecords);

                // 6. Cleanup old daily schedules
                const cleanupDate = new Date();
                cleanupDate.setDate(cleanupDate.getDate() - DAILY_KEEP_HISTORY_DAYS);
                const cleanupDateStr = cleanupDate.toISOString().split('T')[0];

                await tx.delete(dailySchedule)
                    .where(lte(dailySchedule.date, cleanupDateStr));
            });

            // Log success
            dbLog({
                description: `History updated successfully for ${targetSchoolIds.length} schools. ${historyRecords.length} records added.`,
                metadata: { date: targetDate, schoolsCount: targetSchoolIds.length, records: historyRecords.length }
            });
        }

        // 7. Invalidate history cache - ONLY after successful transaction
        try {
            // Important: Importing revalidateTag dynamically as this might run in a non-server context
            const { revalidateTag } = await import('next/cache');
            const { cacheTags } = await import('@/lib/cacheTags');

            for (const schoolId of targetSchoolIds) {
                // We clear both the specific date and the school-wide history cache
                revalidateTag(cacheTags.history(schoolId));
                revalidateTag(cacheTags.historyByDate(schoolId, targetDate));
            }
        } catch (_e) {
            // next/cache might not be available in all environments (e.g. standalone scripts or certain worker runtimes)
            // This is non-critical as the cache has a 7-day TTL fallback.
        }

        return {
            success: true,
            logs: [],
            schoolsUpdated: targetSchoolIds.length,
            recordsCount: historyRecords.length
        };

    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        dbLog({
            description: `History update CRITICAL FAILURE: ${errorMsg}`,
            metadata: { date: targetDate, schoolsCount: targetSchoolIds.length, error: errorMsg }
        });
        return { success: false, logs: [errorMsg], schoolsUpdated: 0, recordsCount: 0 };
    }
}
