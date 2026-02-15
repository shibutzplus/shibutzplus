/**
 * Used in Teacher Portal to display teacher schedule (material page)
 */
import { DailyScheduleType } from "@/models/types/dailySchedule";
import { and, eq, or, inArray } from "drizzle-orm";
import { db, schema } from "@/db";
import { unstable_cache } from "next/cache";
import { cacheTags } from "@/lib/cacheTags";

//
// called from getCachedTeacherSchedule
//
async function getTeacherScheduleService(
    teacherId: string,
    date: string,
): Promise<DailyScheduleType[]> {
    // 1. Get Annual Schedule (to show regular schedule graid)
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay() + 1; // 1-7 (Sunday is 1)

    const [annualSchedules, dailySchedules] = await Promise.all([
        // 1. Get Annual Schedule (to show regular schedule graid)
        db.query.annualSchedule.findMany({
            where: and(
                eq(schema.annualSchedule.teacherId, teacherId),
                eq(schema.annualSchedule.day, dayOfWeek),
            ),
            with: {
                subject: true,
                class: true,
                school: true,
            },
        }),

        // 2. Get daily schedule entries
        db.query.dailySchedule.findMany({
            where: and(
                eq(schema.dailySchedule.date, date),
                or(
                    eq(schema.dailySchedule.subTeacherId, teacherId),
                    eq(schema.dailySchedule.originalTeacherId, teacherId),
                ),
            ),
            with: {
                subject: true,
                originalTeacher: true,
                subTeacher: true,
                school: true,
            },
            orderBy: schema.dailySchedule.hour,
        })
    ]);

    // Fetch classes array manually since it's an array of IDs
    const allClassIds = new Set<string>();
    dailySchedules.forEach((schedule: any) => {
        if (schedule.classIds && Array.isArray(schedule.classIds)) {
            schedule.classIds.forEach((id: string) => allClassIds.add(id));
        }
    });

    const classesData =
        allClassIds.size > 0
            ? await db.query.classes.findMany({
                where: inArray(schema.classes.id, Array.from(allClassIds)),
            })
            : [];

    const classesMap = new Map(classesData.map((c: any) => [c.id, c]));

    const getClasses = (schedule: any) => {
        if (
            schedule.classIds &&
            Array.isArray(schedule.classIds) &&
            schedule.classIds.length > 0
        ) {
            return schedule.classIds
                .map((id: string) => classesMap.get(id))
                .filter(Boolean);
        }
        return [];
    };

    const dailyMap = new Map<number, any>();
    dailySchedules.forEach((ds: any) => dailyMap.set(ds.hour, ds));

    const results: DailyScheduleType[] = [];
    // Process Annual Schedule First
    annualSchedules.forEach((annual: any) => {
        const hour = annual.hour;
        const dailyEntry = dailyMap.get(hour);

        // If there is ANY daily entry for this hour involving this teacher (as original or sub),
        // it overrides the annual schedule entry.
        const showAnnual = !dailyEntry;

        if (showAnnual) {
            results.push({
                id: annual.id,
                date: new Date(date),
                day: annual.day,
                hour: annual.hour,
                columnId: `annual-${annual.id}`,
                columnType: 1, // existingTeacher
                school: annual.school,
                classes: annual.class ? [annual.class] : [],
                subject: annual.subject,
                isRegular: true,
                position: 0,
                createdAt: annual.createdAt,
                updatedAt: annual.updatedAt,
            });
        }
    });

    // Process Daily Schedules
    dailySchedules.forEach((ds: any) => {
        const isSub = ds.subTeacherId === teacherId;
        const isOriginal = ds.originalTeacherId === teacherId;
        const isReplaced = ds.subTeacherId && ds.subTeacherId !== teacherId;

        // Show daily item if:
        // 1. I am the substitute teacher
        // 2. I am the original teacher (even if replaced, so I can see "Replaced by X")
        if (isSub || isOriginal) {
            results.push({
                id: ds.id,
                date: new Date(ds.date),
                day: ds.day,
                hour: ds.hour,
                columnId: ds.columnId || `daily-${ds.id}`,
                eventTitle: ds.eventTitle || undefined,
                event: ds.event || undefined,
                school: ds.school,
                classes: getClasses(ds),
                subject: ds.subject || undefined,
                originalTeacher: ds.originalTeacher || undefined,
                columnType: ds.columnType || undefined,
                subTeacher: ds.subTeacher || undefined,
                position: ds.position || 0,
                instructions: ds.instructions || undefined,
                isRegular: (isOriginal && !isReplaced && ds.columnType === 1 && !ds.event),
                createdAt: ds.createdAt,
                updatedAt: ds.updatedAt,
            });
        }
    });

    return results.sort((a: any, b: any) => a.hour - b.hour);
}

/**
 * Cached version of getTeacherScheduleService.
 * 
 * Uses unstable_cache with proper cache keys and school-level revalidation tag.
 * When a schedule is published for a school, calling revalidateTag(cacheTags.schoolSchedule(schoolId))
 * will invalidate ALL teacher caches for that school at once.
 * 
 * @param teacherId - The teacher ID
 * @param date - The date string (YYYY-MM-DD)
 * @param schoolId - The school ID (required for revalidation tag)
 * @returns Teacher's schedule for the specified date
 */
export async function getCachedTeacherSchedule(
    teacherId: string,
    date: string,
    schoolId: string,
): Promise<DailyScheduleType[]> {
    const cachedFn = unstable_cache(
        async () => getTeacherScheduleService(teacherId, date),
        // Cache keys - MUST include ALL parameters that affect the result
        // This prevents Vercel from serving Teacher A's cache to Teacher B
        ['getTeacherSchedule', teacherId, date],
        {
            // Tags for revalidation:
            // 1. teacher-specific tag - for targeted invalidation of a single teacher
            // 2. school-level tag - for invalidating ALL teachers when publishing
            tags: [
                cacheTags.teacherSchedule(teacherId),
                cacheTags.schoolSchedule(schoolId)
            ],
            revalidate: 86400, // 24 hours - since we have precise tag invalidation, we can use longer TTL
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

