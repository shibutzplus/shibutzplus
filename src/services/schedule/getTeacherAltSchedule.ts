/**
 * Fetches teacher schedule from annual_schedule_alt for use in the emergency schedule portal.
 * Unlike the regular schedule, this is NOT date-published — it reads from the alt annual table
 * using the day-of-week derived from the given date.
 */
import { DailyScheduleType } from "@/models/types/dailySchedule";
import { and, eq } from "drizzle-orm";
import { db, schema } from "@/db";

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
