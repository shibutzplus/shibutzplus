
import { unstable_cache } from "next/cache";
import { db, schema } from "@/db";
import { and, eq } from "drizzle-orm";
import { cacheTags } from "@/lib/cacheTags";
import { DailyScheduleType } from "@/models/types/dailySchedule";

export async function getCachedDailySchedule(
    schoolId: string,
    date: string
): Promise<DailyScheduleType[]> {
    const cachedFn = unstable_cache(
        async () => {
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
        },
        ['getDailySchedule', schoolId, date],
        {
            tags: [cacheTags.dailySchedule(schoolId, date)],
            revalidate: 86400, // 24 hours
        }
    );

    return cachedFn();
}
