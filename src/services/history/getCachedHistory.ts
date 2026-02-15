/**
 * This service provides cached access to history data.
 * The history table is updated daily at a fixed evening hour via src/services/history/updateHistory.ts.
 * We use a 7-day revalidation period as a fallback, but the cache is explicitly invalidated
 * during the daily update process to ensure accurate data.
 */

import { db, executeQuery } from "@/db";
import { history } from "@/db/schema";
import { and, eq, or } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { cacheTags } from "@/lib/cacheTags";
import { DailyScheduleType, ColumnType } from "@/models/types/dailySchedule";
import { TeacherType, TeacherRoleValues } from "@/models/types/teachers";
import { SubjectType } from "@/models/types/subjects";
import { ClassType } from "@/models/types/classes";
import { SchoolType } from "@/models/types/school";
import { SCHOOL_LEVEL, SCHOOL_STATUS } from "@/models/constant/school";

// Helper types for history mapping
interface HistoryRecord {
    id: string;
    schoolId: string;
    date: string;
    day: number;
    hour: number;
    columnId: string;
    columnPosition: number;
    columnType: number;
    originalTeacher: string | null;
    classes: string | null;
    subject: string | null;
    subTeacher: string | null;
    instructions: string | null;
    eventTitle: string | null;
    eventText: string | null;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Maps a raw history record to the DailyScheduleType expected by the UI.
 * Note: History records contain minimal data (strings), so we mock the entity objects.
 */
function mapHistoryToSchedule(record: HistoryRecord, schoolId: string): DailyScheduleType {
    // Helper to create mock objects
    const makeTeacher = (name: string | null): TeacherType | undefined =>
        name ? { id: "history-teacher", name, schoolId, role: TeacherRoleValues.REGULAR } as TeacherType : undefined;

    const makeSubject = (name: string | null): SubjectType | undefined =>
        name ? { id: "history-subject", name, schoolId } as SubjectType : undefined;

    const makeClasses = (namesStr: string | null): ClassType[] | undefined => {
        if (!namesStr) return undefined;
        return namesStr.split(', ').map((name, index) => ({
            id: `history-class-${index}`,
            name,
            schoolId,
            activity: false // History does not preserve activity status
        }));
    };

    // Mock School Object (minimal)
    const mockSchool: SchoolType = {
        id: record.schoolId,
        name: "", // Not stored in history
        type: SCHOOL_LEVEL.ELEMENTARY,
        status: SCHOOL_STATUS.DAILY,
        publishDates: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        fromHour: 1,
        toHour: 8,
        displaySchedule2Susb: false
    };

    return {
        id: record.id,
        date: new Date(record.date),
        day: record.day,
        hour: record.hour,
        columnId: record.columnId,
        eventTitle: record.eventTitle || undefined,
        event: record.eventText || undefined,
        school: mockSchool,
        classes: makeClasses(record.classes),
        subject: makeSubject(record.subject),
        originalTeacher: makeTeacher(record.originalTeacher),
        columnType: record.columnType as ColumnType,
        subTeacher: makeTeacher(record.subTeacher),
        instructions: record.instructions || undefined,
        position: record.columnPosition,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt
    };
}

/**
 * Cached service to fetch history schedule for a specific date.
 */
export async function getCachedHistorySchedule(
    schoolId: string,
    date: string
): Promise<DailyScheduleType[]> {
    const cachedFn = unstable_cache(
        async () => {
            return await executeQuery(async () => {
                const historyRecords = await db
                    .select()
                    .from(history)
                    .where(
                        and(
                            eq(history.schoolId, schoolId),
                            eq(history.date, date)
                        )
                    );

                if (!historyRecords) return [];

                return historyRecords.map(record => mapHistoryToSchedule(record as unknown as HistoryRecord, schoolId));
            });
        },
        ['getHistorySchedule', schoolId, date],
        {
            tags: [cacheTags.historyByDate(schoolId, date), cacheTags.history(schoolId)],
            revalidate: 604800, // 7 days (history shouldn't change often)
        }
    );

    return cachedFn();
}

/**
 * Cached service to fetch teacher history schedule for a specific date.
 */
export async function getCachedTeacherHistorySchedule(
    schoolId: string,
    date: string,
    teacherName: string
): Promise<DailyScheduleType[]> {
    const cachedFn = unstable_cache(
        async () => {
            return await executeQuery(async () => {
                const historyRecords = await db
                    .select()
                    .from(history)
                    .where(
                        and(
                            eq(history.schoolId, schoolId),
                            eq(history.date, date),
                            or(
                                eq(history.originalTeacher, teacherName),
                                eq(history.subTeacher, teacherName)
                            )
                        )
                    );

                if (!historyRecords) return [];

                return historyRecords.map(record => mapHistoryToSchedule(record as unknown as HistoryRecord, schoolId))
                    .sort((a, b) => a.hour - b.hour);
            });
        },
        ['getTeacherHistorySchedule', schoolId, date, teacherName],
        {
            tags: [
                cacheTags.historyByDate(schoolId, date),
                cacheTags.history(schoolId),
            ],
            revalidate: 604800, // 7 days
        }
    );

    return cachedFn();
}
