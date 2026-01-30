"use server";
import { db, schema, executeQuery } from "@/db";
import { eq, and, sql } from "drizzle-orm";
import { ActionResponse } from "@/models/types/actions";
import { ColumnTypeValues } from "@/models/types/dailySchedule";
import { getHebrewMonthName, getCurrentSchoolYearRange } from "@/utils/time";
import { checkAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { dbLog } from "@/services/loggerService";

export type AbsenceByMonth = {
    month: string;
    count: number;
}

export const getAbsencesByMonthAction = async (schoolId: string): Promise<ActionResponse<AbsenceByMonth[]>> => {
    try {
        const authError = await checkAuthAndParams({ schoolId });
        if (authError) {
            return authError as ActionResponse<AbsenceByMonth[]>;
        }

        const { start, end } = getCurrentSchoolYearRange();

        const result = await executeQuery(async () => {
            return await db
                .select({
                    year: sql<number>`EXTRACT(YEAR FROM ${schema.history.date})`,
                    monthNum: sql<number>`EXTRACT(MONTH FROM ${schema.history.date})`,
                    count: sql<number>`count(DISTINCT CONCAT(${schema.history.originalTeacher}, ${schema.history.date}))`
                })
                .from(schema.history)
                .where(
                    and(
                        eq(schema.history.schoolId, schoolId),
                        eq(schema.history.columnType, ColumnTypeValues.missingTeacher),
                        sql`${schema.history.date} >= ${start} AND ${schema.history.date} <= ${end}`
                    )
                )
                .groupBy(sql`EXTRACT(YEAR FROM ${schema.history.date})`, sql`EXTRACT(MONTH FROM ${schema.history.date})`)
                .orderBy(sql`EXTRACT(YEAR FROM ${schema.history.date})`, sql`EXTRACT(MONTH FROM ${schema.history.date})`);
        });

        if (!result) {
            return {
                success: true,
                data: [],
            };
        }

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
        };

    } catch (error) {
        dbLog({ description: `Error fetching absences by month: ${error instanceof Error ? error.message : String(error)}`, schoolId });
        return {
            success: false,
            message: messages.common.serverError,
        };
    }
}
