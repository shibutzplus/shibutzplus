'use server'

import { db } from "@/db"
import { history } from "@/db/schema/history"
import { eq, and, sql, desc } from "drizzle-orm"
import { ActionResponse } from "@/models/types/actions"

import { SCHOOL_MONTHS } from "@/utils/time"

export type AbsenceByTeacher = {
    teacherName: string;
    count: number;
}

export const getAbsencesByTeacherAction = async (schoolId: string, month?: string): Promise<ActionResponse<AbsenceByTeacher[]>> => {
    try {
        const conditions = [
            eq(history.schoolId, schoolId),
            eq(history.columnType, 0) // 0 is missingTeacher
        ];

        if (month && month !== "all") {
            const monthIndex = SCHOOL_MONTHS.indexOf(month);
            if (monthIndex !== -1) {
                // Determine month number (1-12) based on SCHOOL_MONTHS order (Sept starts at index 0 -> month 9)
                // 0 -> 9, 1 -> 10, 2 -> 11, 3 -> 12, 4 -> 1 ...
                const monthNum = ((monthIndex + 8) % 12) + 1;
                conditions.push(sql`EXTRACT(MONTH FROM ${history.date}) = ${monthNum}`);
            }
        }

        const result = await db
            .select({
                teacherName: history.originalTeacher,
                count: sql<number>`count(DISTINCT ${history.date})`
            })
            .from(history)
            .where(and(...conditions))
            .groupBy(history.originalTeacher)
            .orderBy(desc(sql`count(DISTINCT ${history.date})`));

        const formattedResult = result.map(row => ({
            teacherName: row.teacherName || 'Unknown',
            count: Number(row.count)
        }));

        return {
            success: true,
            data: formattedResult,
        }

    } catch (_error) {
        return {
            success: false,
            message: "Failed to fetch absences by teacher",
        }
    }
}
