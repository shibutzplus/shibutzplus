/**
 * Used in Teacher Portal to display full school schedule
 */
import { DailyScheduleType } from "@/models/types/dailySchedule";
import { and, eq } from "drizzle-orm";
import { db, schema, executeQuery } from "@/db";
import { unstable_cache } from "next/cache";
import { cacheTags } from "@/lib/cacheTags";

/**
 * Internal service to fetch daily schedule from database.
 * Used by getCachedDailySchedule - do not call directly.
 */
async function getDailyScheduleService(
    schoolId: string,
    date: string,
): Promise<DailyScheduleType[]> {
    const dailySchedule = await executeQuery(async () => {
        const schedules = await db.query.dailySchedule.findMany({
            where: and(
                eq(schema.dailySchedule.schoolId, schoolId),
                eq(schema.dailySchedule.date, date),
            ),
        });

        return schedules.map(
            (schedule: any) =>
                ({
                    id: schedule.id,
                    date: schedule.date,
                    day: schedule.day,
                    hour: schedule.hour,
                    columnId: schedule.columnId,
                    eventTitle: schedule.eventTitle,
                    event: schedule.event,
                    schoolId: schedule.schoolId,
                    classIds: schedule.classIds,
                    subjectId: schedule.subjectId,
                    originalTeacherId: schedule.originalTeacherId,
                    columnType: schedule.columnType,
                    subTeacherId: schedule.subTeacherId,
                    position: schedule.position,
                    createdAt: schedule.createdAt,
                    updatedAt: schedule.updatedAt,
                }) as unknown as DailyScheduleType,
        );
    });

    return dailySchedule;
}

/**
 * Cached version of daily schedule retrieval for public schedule-full page.
 * 
 * Uses unstable_cache with school-level revalidation tag.
 * When schedule data changes for a school, calling revalidateTag(cacheTags.schoolSchedule(schoolId))
 * will invalidate this cache along with all teacher caches.
 * 
 * @param schoolId - The school ID
 * @param date - The date string (YYYY-MM-DD format expected by DB)
 * @returns Daily schedule data for the specified school and date
 */
export async function getCachedDailySchedule(
    schoolId: string,
    date: string,
): Promise<DailyScheduleType[]> {
    const cachedFn = unstable_cache(
        async () => getDailyScheduleService(schoolId, date),
        // Cache keys - MUST include ALL parameters that affect the result
        ['getDailySchedule', schoolId, date],
        {
            // School-level tag for bulk invalidation
            tags: [cacheTags.schoolSchedule(schoolId)],
            revalidate: 86400, // 24 hours - since we have precise tag invalidation
        }
    );

    const cachedResults = await cachedFn();

    // IMPORTANT: unstable_cache serializes Date objects to strings
    // We need to convert them back to Date objects
    return cachedResults.map(schedule => ({
        ...schedule,
        date: typeof schedule.date === 'string' ? new Date(schedule.date) : schedule.date,
        createdAt: typeof schedule.createdAt === 'string' ? new Date(schedule.createdAt) : schedule.createdAt,
        updatedAt: typeof schedule.updatedAt === 'string' ? new Date(schedule.updatedAt) : schedule.updatedAt,
    }));
}
