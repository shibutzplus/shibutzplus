"use server";
import { db, schema, executeQuery } from "@/db";
import { eq, and, sql, desc } from "drizzle-orm";
import { ActionResponse } from "@/models/types/actions";
import { ColumnTypeValues } from "@/models/types/dailySchedule";
import { SCHOOL_MONTHS, getCurrentSchoolYearRange } from "@/utils/time";
import { checkAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { dbLog } from "@/services/loggerService";

export type AbsenceByTeacher = {
    teacherName: string;
    count: number;
}

export const getAbsencesByTeacherAction = async (schoolId: string, month?: string): Promise<ActionResponse<AbsenceByTeacher[]>> => {
    try {
        const authError = await checkAuthAndParams({ schoolId });
        if (authError) {
            return authError as ActionResponse<AbsenceByTeacher[]>;
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
                // Determine month number (1-12) based on SCHOOL_MONTHS order (Sept starts at index 0 -> month 9)
                // 0 -> 9, 1 -> 10, 2 -> 11, 3 -> 12, 4 -> 1 ...
                const monthNum = ((monthIndex + 8) % 12) + 1;
                conditions.push(sql`EXTRACT(MONTH FROM ${schema.history.date}) = ${monthNum}`);
            }
        }

        const result = await executeQuery(async () => {
            return await db
                .select({
                    teacherName: schema.history.originalTeacher,
                    count: sql<number>`count(DISTINCT ${schema.history.date})`
                })
                .from(schema.history)
                .where(and(...conditions))
                .groupBy(schema.history.originalTeacher)
                .orderBy(desc(sql`count(DISTINCT ${schema.history.date})`));
        });

        if (!result) {
            return {
                success: true,
                data: [],
            };
        }

        const formattedResult = result.map(row => ({
            teacherName: row.teacherName || 'Unknown',
            count: Number(row.count)
        }));

        return {
            success: true,
            data: formattedResult,
        };

    } catch (error) {
        dbLog({ description: `Error fetching absences by teacher: ${error instanceof Error ? error.message : String(error)}`, schoolId });
        return {
            success: false,
            message: messages.common.serverError,
        };
    }
}
