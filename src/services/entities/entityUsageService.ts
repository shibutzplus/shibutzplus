import { db, schema, executeQuery } from "@/db";
import { and, eq, sql } from "drizzle-orm";

export interface EntityUsageSummary {
    annualCount: number;
    annualAltCount: number;
    dailyCount: number;
    totalCount: number;
}

/**
 * Counts usage of a subject in annual, annualAlt, and daily schedules for a school.
 */
export async function getSubjectUsageCount(
    schoolId: string,
    subjectId: string,
): Promise<EntityUsageSummary> {
    return await executeQuery(async () => {
        const [annualRes, annualAltRes, dailyRes] = await Promise.all([
            db
                .select({ count: sql<number>`count(*)::int` })
                .from(schema.annualSchedule)
                .where(
                    and(
                        eq(schema.annualSchedule.schoolId, schoolId),
                        eq(schema.annualSchedule.subjectId, subjectId),
                    ),
                ),
            db
                .select({ count: sql<number>`count(*)::int` })
                .from(schema.annualScheduleAlt)
                .where(
                    and(
                        eq(schema.annualScheduleAlt.schoolId, schoolId),
                        eq(schema.annualScheduleAlt.subjectId, subjectId),
                    ),
                ),
            db
                .select({ count: sql<number>`count(*)::int` })
                .from(schema.dailySchedule)
                .where(
                    and(
                        eq(schema.dailySchedule.schoolId, schoolId),
                        eq(schema.dailySchedule.subjectId, subjectId),
                    ),
                ),
        ]);

        const annualCount = annualRes[0]?.count ?? 0;
        const annualAltCount = annualAltRes[0]?.count ?? 0;
        const dailyCount = dailyRes[0]?.count ?? 0;

        return {
            annualCount,
            annualAltCount,
            dailyCount,
            totalCount: annualCount + annualAltCount + dailyCount,
        };
    });
}

/**
 * Counts usage of a teacher in annual, annualAlt, and daily schedules for a school.
 */
export async function getTeacherUsageCount(
    schoolId: string,
    teacherId: string,
): Promise<EntityUsageSummary> {
    return await executeQuery(async () => {
        const [annualRes, annualAltRes, dailyRes] = await Promise.all([
            db
                .select({ count: sql<number>`count(*)::int` })
                .from(schema.annualSchedule)
                .where(
                    and(
                        eq(schema.annualSchedule.schoolId, schoolId),
                        eq(schema.annualSchedule.teacherId, teacherId),
                    ),
                ),
            db
                .select({ count: sql<number>`count(*)::int` })
                .from(schema.annualScheduleAlt)
                .where(
                    and(
                        eq(schema.annualScheduleAlt.schoolId, schoolId),
                        eq(schema.annualScheduleAlt.teacherId, teacherId),
                    ),
                ),
            db
                .select({ count: sql<number>`count(*)::int` })
                .from(schema.dailySchedule)
                .where(
                    and(
                        eq(schema.dailySchedule.schoolId, schoolId),
                        sql`(${schema.dailySchedule.originalTeacherId} = ${teacherId} OR ${schema.dailySchedule.subTeacherId} = ${teacherId})`,
                    ),
                ),
        ]);

        const annualCount = annualRes[0]?.count ?? 0;
        const annualAltCount = annualAltRes[0]?.count ?? 0;
        const dailyCount = dailyRes[0]?.count ?? 0;

        return {
            annualCount,
            annualAltCount,
            dailyCount,
            totalCount: annualCount + annualAltCount + dailyCount,
        };
    });
}

/**
 * Counts usage of a class in annual, annualAlt, and daily schedules for a school.
 */
export async function getClassUsageCount(
    schoolId: string,
    classId: string,
): Promise<EntityUsageSummary> {
    return await executeQuery(async () => {
        const [annualRes, annualAltRes, dailyRes] = await Promise.all([
            db
                .select({ count: sql<number>`count(*)::int` })
                .from(schema.annualSchedule)
                .where(
                    and(
                        eq(schema.annualSchedule.schoolId, schoolId),
                        eq(schema.annualSchedule.classId, classId),
                    ),
                ),
            db
                .select({ count: sql<number>`count(*)::int` })
                .from(schema.annualScheduleAlt)
                .where(
                    and(
                        eq(schema.annualScheduleAlt.schoolId, schoolId),
                        eq(schema.annualScheduleAlt.classId, classId),
                    ),
                ),
            db
                .select({ count: sql<number>`count(*)::int` })
                .from(schema.dailySchedule)
                .where(
                    and(
                        eq(schema.dailySchedule.schoolId, schoolId),
                        sql`${classId} = ANY(${schema.dailySchedule.classIds})`,
                    ),
                ),
        ]);

        const annualCount = annualRes[0]?.count ?? 0;
        const annualAltCount = annualAltRes[0]?.count ?? 0;
        const dailyCount = dailyRes[0]?.count ?? 0;

        return {
            annualCount,
            annualAltCount,
            dailyCount,
            totalCount: annualCount + annualAltCount + dailyCount,
        };
    });
}
