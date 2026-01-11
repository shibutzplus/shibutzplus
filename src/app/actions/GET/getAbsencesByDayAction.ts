'use server'

import { db } from "@/db"
import { history } from "@/db/schema/history"
import { eq, and, sql } from "drizzle-orm"
import { ActionResponse } from "@/models/types/actions"
import { DAYS_OF_WEEK_FORMAT } from "@/utils/time"

import { SCHOOL_MONTHS } from "@/utils/time"

export type AbsenceByDay = {
    day: string;
    count: number;
}

export const getAbsencesByDayAction = async (schoolId: string, month?: string): Promise<ActionResponse<AbsenceByDay[]>> => {
    try {
        const conditions = [
            eq(history.schoolId, schoolId),
            eq(history.columnType, 0) // 0 is missingTeacher
        ];

        if (month && month !== "all") {
            const monthIndex = SCHOOL_MONTHS.indexOf(month);
            if (monthIndex !== -1) {
                // Determine month number (1-12) based on SCHOOL_MONTHS order
                const monthNum = ((monthIndex + 8) % 12) + 1;
                conditions.push(sql`EXTRACT(MONTH FROM ${history.date}) = ${monthNum}`);
            }
        }

        const result = await db
            .select({
                day: history.day,
                count: sql<number>`count(DISTINCT CONCAT(${history.originalTeacher}, ${history.date}))`
            })
            .from(history)
            .where(and(...conditions))
            .groupBy(history.day)
            .orderBy(history.day);

        const formattedResult = result.map(row => {
            const dayIndex = row.day - 1;
            const dayName = (dayIndex >= 0 && dayIndex < DAYS_OF_WEEK_FORMAT.length) ? DAYS_OF_WEEK_FORMAT[dayIndex] : "לא ידוע";

            return {
                day: dayName,
                count: Number(row.count)
            };
        });

        return {
            success: true,
            data: formattedResult,
        }

    } catch (error) {
        console.error("Error fetching absences by day:", error)
        return {
            success: false,
            message: "Failed to fetch absences by day",
        }
    }
}
