/**
 * Fetches teacher schedule from annual_schedule_alt for use in the emergency schedule portal.
 * Unlike the regular schedule, this is NOT date-published — it reads from the alt annual table
 * using the day-of-week derived from the given date.
 */
import { DailyScheduleType } from "@/models/types/dailySchedule";
import { and, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { unstable_cache } from "next/cache";
import { cacheTags } from "@/lib/cacheTags";

export async function getTeacherAltSchedule(
    teacherId: string,
    date: string,
): Promise<DailyScheduleType[]> {
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay() + 1; // 1=Sunday ... 7=Saturday

    const altSchedules = await db.query.annualScheduleAlt.findMany({
        where: and(
            eq(schema.annualScheduleAlt.teacherId, teacherId),
            eq(schema.annualScheduleAlt.day, dayOfWeek),
        ),
        with: {
            subject: true,
            class: true,
            school: true,
        },
    });

    const results: DailyScheduleType[] = altSchedules.map((entry: any) => {
        // Parse as local midnight (not UTC midnight) to avoid timezone shift
        // new Date("YYYY-MM-DD") parses as UTC, which in UTC+2 becomes the previous day
        const [year, month, day] = date.split("-").map(Number);
        const localDate = new Date(year, month - 1, day, 12, 0, 0); // noon local time

        return {
            id: entry.id,
            date: localDate,
            day: entry.day,
            hour: entry.hour,
            columnId: `alt-annual-${entry.id}`,
            columnType: 1,
            school: entry.school,
            classes: entry.class ? [entry.class] : [],
            subject: entry.subject,
            isRegular: true,
            position: 0,
            createdAt: entry.createdAt,
            updatedAt: entry.updatedAt,
        };
    });

    return results.sort((a, b) => a.hour - b.hour);
}

/**
 * Cached version of getTeacherAltSchedule.
 * Uses unstable_cache with proper cache keys and school-level revalidation tag.
 */
export async function getCachedTeacherAltSchedule(
    schoolId: string,
    teacherId: string,
    date: string,
): Promise<DailyScheduleType[]> {
    const cachedFn = unstable_cache(
        async () => {
            return await getTeacherAltSchedule(teacherId, date);
        },
        [`alt-schedule-${schoolId}-${teacherId}-${date}`], // Unique key array
        {
            tags: [
                cacheTags.annualAltSchedule(schoolId),
                cacheTags.teacherScheduleByDate(teacherId, date),
            ],
            revalidate: 86400, // 24 hours
        }
    );

    const data = await cachedFn();

    // IMPORTANT: unstable_cache serializes Date objects to strings
    // We must parse them back to Date objects before returning to UI
    return data.map((item: any) => ({
        ...item,
        date: item.date ? new Date(item.date) : new Date(),
        createdAt: item.createdAt ? new Date(item.createdAt) : undefined,
        updatedAt: item.updatedAt ? new Date(item.updatedAt) : undefined,
    }));
}
