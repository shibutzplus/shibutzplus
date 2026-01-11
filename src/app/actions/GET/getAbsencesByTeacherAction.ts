"use server";
import { db, schema, executeQuery } from "@/db";
import { eq, and, sql, desc } from "drizzle-orm";
import { ActionResponse } from "@/models/types/actions";
import { SCHOOL_MONTHS } from "@/utils/time";
import { checkAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";

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

        const conditions = [
            eq(schema.history.schoolId, schoolId),
            eq(schema.history.columnType, 0) // 0 is missingTeacher
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
        console.error("Error fetching absences by teacher:", error);
        return {
            success: false,
            message: messages.common.serverError,
        };
    }
}
