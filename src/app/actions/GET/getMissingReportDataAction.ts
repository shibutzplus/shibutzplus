"use server";
import { db, schema, executeQuery } from "@/db";
import { eq, and, sql, or } from "drizzle-orm";
import { ActionResponse } from "@/models/types/actions";
import { ColumnTypeValues } from "@/models/types/dailySchedule";
import { SCHOOL_MONTHS, getCurrentSchoolYearRange } from "@/utils/time";
import { checkAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { dbLog } from "@/services/loggerService";

export type MissingReportRecord = {
    date: Date;
    dayOfMonth: number;
    originalTeacher: string | null;
    columnType: number;
    reason: string | null;
    hour: number;
    classes: string | null;
    subTeacher: string | null;
    eventText: string | null;
}

export const getMissingReportDataAction = async (schoolId: string, month: string): Promise<ActionResponse<MissingReportRecord[]>> => {
    try {
        const authError = await checkAuthAndParams({ schoolId });
        if (authError) {
            return authError as ActionResponse<MissingReportRecord[]>;
        }

        const { start, end } = getCurrentSchoolYearRange();

        const conditions = [
            eq(schema.history.schoolId, schoolId),
            or(
                eq(schema.history.columnType, ColumnTypeValues.missingTeacher),
                eq(schema.history.columnType, ColumnTypeValues.existingTeacher)
            ),
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
                    date: schema.history.date,
                    dayOfMonth: sql<number>`EXTRACT(DAY FROM ${schema.history.date})`,
                    originalTeacher: schema.history.originalTeacher,
                    columnType: schema.history.columnType,
                    reason: schema.history.reason,
                    hour: schema.history.hour,
                    classes: schema.history.classes,
                    subTeacher: schema.history.subTeacher,
                    eventText: schema.history.eventText,
                })
                .from(schema.history)
                .where(and(...conditions));
        });

        if (!result) {
            return {
                success: true,
                data: [],
            };
        }

        const formattedResult = result.map(row => ({
            ...row,
            date: new Date(row.date),
            dayOfMonth: Number(row.dayOfMonth)
        }));

        return {
            success: true,
            data: formattedResult,
        };

    } catch (error) {
        dbLog({ description: `Error fetching missing report data: ${error instanceof Error ? error.message : String(error)}`, schoolId });
        return {
            success: false,
            message: messages.common.serverError,
        };
    }
}
