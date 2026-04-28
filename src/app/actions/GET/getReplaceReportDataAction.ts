"use server";
import { db, schema, executeQuery } from "@/db";
import { eq, and, sql, isNotNull } from "drizzle-orm";
import { ActionResponse } from "@/models/types/actions";
import { SCHOOL_MONTHS, getCurrentSchoolYearRange } from "@/utils/time";
import { checkAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { dbLog } from "@/services/loggerService";

export type ReplaceReportRecord = {
    date: Date;
    dayOfMonth: number;
    subTeacher: string;
    hour: number;
    columnType: number;
};

export const getReplaceReportDataAction = async (
    schoolId: string,
    month: string
): Promise<ActionResponse<ReplaceReportRecord[]>> => {
    try {
        const authError = await checkAuthAndParams({ schoolId });
        if (authError) {
            return authError as ActionResponse<ReplaceReportRecord[]>;
        }

        const { start, end } = getCurrentSchoolYearRange();

        const conditions = [
            eq(schema.history.schoolId, schoolId),
            isNotNull(schema.history.subTeacher),
            sql`${schema.history.date} >= ${start} AND ${schema.history.date} <= ${end}`,
        ];

        if (month && month !== "all") {
            const monthIndex = SCHOOL_MONTHS.indexOf(month);
            if (monthIndex !== -1) {
                const monthNum = ((monthIndex + 8) % 12) + 1;
                conditions.push(
                    sql`EXTRACT(MONTH FROM ${schema.history.date}) = ${monthNum}`
                );
            }
        }

        const result = await executeQuery(async () => {
            return await db
                .select({
                    date: schema.history.date,
                    dayOfMonth: sql<number>`EXTRACT(DAY FROM ${schema.history.date})`,
                    subTeacher: schema.history.subTeacher,
                    hour: schema.history.hour,
                    columnType: schema.history.columnType,
                })
                .from(schema.history)
                .where(and(...conditions));
        });

        if (!result) {
            return { success: true, data: [] };
        }

        const formattedResult = result
            .filter((row): row is typeof row & { subTeacher: string } =>
                !!row.subTeacher
            )
            .map((row) => ({
                ...row,
                date: new Date(row.date),
                dayOfMonth: Number(row.dayOfMonth),
            }));

        return { success: true, data: formattedResult };
    } catch (error) {
        dbLog({
            description: `Error fetching replace report data: ${error instanceof Error ? error.message : String(error)}`,
            schoolId,
        });
        return { success: false, message: messages.common.serverError };
    }
};
