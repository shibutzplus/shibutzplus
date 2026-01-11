'use server'

import { db } from "@/db"
import { history } from "@/db/schema/history"
import { eq, and, sql } from "drizzle-orm"
import { ActionResponse } from "@/models/types/actions"
import { getHebrewMonthName } from "@/utils/time"

export type AbsenceByMonth = {
    month: string;
    count: number;
}

export const getAbsencesByMonthAction = async (schoolId: string): Promise<ActionResponse<AbsenceByMonth[]>> => {
    try {
        const result = await db
            .select({
                year: sql<number>`EXTRACT(YEAR FROM ${history.date})`,
                monthNum: sql<number>`EXTRACT(MONTH FROM ${history.date})`,
                count: sql<number>`count(DISTINCT CONCAT(${history.originalTeacher}, ${history.date}))`
            })
            .from(history)
            .where(
                and(
                    eq(history.schoolId, schoolId),
                    eq(history.columnType, 0) // 0 is missingTeacher
                )
            )
            .groupBy(sql`EXTRACT(YEAR FROM ${history.date})`, sql`EXTRACT(MONTH FROM ${history.date})`)
            .orderBy(sql`EXTRACT(YEAR FROM ${history.date})`, sql`EXTRACT(MONTH FROM ${history.date})`);

        const formattedResult = result.map(row => {
            const monthIndex = Number(row.monthNum) - 1;
            return {
                month: `${getHebrewMonthName(monthIndex)} ${row.year}`, // e.g., "ספטמבר 2025"
                count: Number(row.count)
            };
        });

        return {
            success: true,
            data: formattedResult,
        }

    } catch (error) {
        console.error("Error fetching absences by month:", error)
        return {
            success: false,
            message: "Failed to fetch absences by month",
        }
    }
}
