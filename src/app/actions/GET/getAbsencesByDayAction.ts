"use server";
import { db, schema, executeQuery } from "@/db";
import { eq, and, sql } from "drizzle-orm";
import { ActionResponse } from "@/models/types/actions";
import { ColumnTypeValues } from "@/models/types/dailySchedule";
import { DAYS_OF_WEEK_FORMAT, SCHOOL_MONTHS, getCurrentSchoolYearRange } from "@/utils/time";
import { checkAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { dbLog } from "@/services/loggerService";

export type AbsenceByDay = {
    day: string;
    count: number;
}

export const getAbsencesByDayAction = async (schoolId: string, month?: string): Promise<ActionResponse<AbsenceByDay[]>> => {
    try {
        const authError = await checkAuthAndParams({ schoolId });
        if (authError) {
            return authError as ActionResponse<AbsenceByDay[]>;
        }

        const { start, end } = getCurrentSchoolYearRange();

        const conditions = [
            eq(schema.history.schoolId, schoolId),
            eq(schema.history.columnType, ColumnTypeValues.missingTeacher),
            sql`${schema.history.date} >= ${start} AND ${schema.history.date} <= ${end}`
        ];

        if (month && month !== "all") {
            const monthIndex = SCHOOL_MONTHS.indexOf(month);
            if (monthIndex !== -1) {
                // Determine month number (1-12) based on SCHOOL_MONTHS order
                const monthNum = ((monthIndex + 8) % 12) + 1;
                conditions.push(sql`EXTRACT(MONTH FROM ${schema.history.date}) = ${monthNum}`);
            }
        }

        const result = await executeQuery(async () => {
            return await db
                .select({
                    day: schema.history.day,
                    count: sql<number>`count(DISTINCT CONCAT(${schema.history.originalTeacher}, ${schema.history.date}))`
                })
                .from(schema.history)
                .where(and(...conditions))
                .groupBy(schema.history.day)
                .orderBy(schema.history.day);
        });

        if (!result) {
            return {
                success: true,
                data: [],
            };
        }

        const formattedResult = result.map(row => {
            const dayIndex = Number(row.day) - 1;
            const dayName = (dayIndex >= 0 && dayIndex < DAYS_OF_WEEK_FORMAT.length) ? DAYS_OF_WEEK_FORMAT[dayIndex] : "לא ידוע";

            return {
                day: dayName,
                count: Number(row.count)
            };
        });

        return {
            success: true,
            data: formattedResult,
        };

    } catch (error) {
        dbLog({ description: `Error fetching absences by day: ${error instanceof Error ? error.message : String(error)}`, schoolId });
        return {
            success: false,
            message: messages.common.serverError,
        };
    }
}
