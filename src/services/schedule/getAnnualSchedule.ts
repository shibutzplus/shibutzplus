import { db, schema, executeQuery } from "@/db";
import { eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { cacheTags } from "@/lib/cacheTags";
import { AnnualScheduleType } from "@/models/types/annualSchedule";

/**
 * Cached service to fetch annual schedule data for a school.
 * 
 * @param schoolId - The school ID
 * @returns Array of annual schedule records
 */
export async function getCachedAnnualSchedule(schoolId: string): Promise<AnnualScheduleType[]> {
    const cachedFn = unstable_cache(
        async () => {
            return await executeQuery(async () => {
                const schedules = await db.query.annualSchedule.findMany({
                    where: eq(schema.annualSchedule.schoolId, schoolId),
                });

                return schedules.map(
                    (schedule: any) =>
                        ({
                            id: schedule.id,
                            day: schedule.day,
                            hour: schedule.hour,
                            schoolId: schedule.schoolId,
                            classId: schedule.classId,
                            teacherId: schedule.teacherId,
                            subjectId: schedule.subjectId,
                            createdAt: schedule.createdAt,
                            updatedAt: schedule.updatedAt,
                        }) as unknown as AnnualScheduleType,
                );
            });
        },
        ['getAnnualSchedule', schoolId],
        {
            tags: [cacheTags.schoolSchedule(schoolId)],
            revalidate: 604800, // 7 days
        }
    );

    return cachedFn();
}
