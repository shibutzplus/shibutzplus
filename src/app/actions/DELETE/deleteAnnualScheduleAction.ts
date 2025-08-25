"use server";

import { ActionResponse } from "@/models/types/actions";
import { AnnualScheduleType } from "@/models/types/annualSchedule";
import { checkAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { db, schema } from "@/db";
import { and, eq } from "drizzle-orm";

export async function deleteAnnualScheduleAction(
    day: number,
    hour: number,
    classId: string,
    schoolId: string,
): Promise<ActionResponse & { deleted?: AnnualScheduleType[] }> {
    try {
        const authError = await checkAuthAndParams({
            day,
            hour,
        });
        if (authError) {
            return authError as ActionResponse;
        }

        // Fetch all rows matching the criteria (before deletion)
        const toDeleteRows = await db.query.annualSchedule.findMany({
            where: and(
                eq(schema.annualSchedule.day, day),
                eq(schema.annualSchedule.hour, hour),
                eq(schema.annualSchedule.classId, classId),
                eq(schema.annualSchedule.schoolId, schoolId)
            ),
            with: {
                school: true,
                class: true,
                teacher: true,
                subject: true,
            },
        });
        if (!toDeleteRows || toDeleteRows.length === 0) {
            return {
                success: false,
                message: "Annual schedule entries not found.",
            };
        }
        // Delete all matching rows
        await db.delete(schema.annualSchedule).where(
            and(
                eq(schema.annualSchedule.day, day),
                eq(schema.annualSchedule.hour, hour),
                eq(schema.annualSchedule.classId, classId),
                eq(schema.annualSchedule.schoolId, schoolId)
            )
        );

        const deleted: AnnualScheduleType[] = toDeleteRows.map((row) => ({
            id: row.id,
            day: row.day,
            hour: row.hour,
            school: row.school ?? null,
            class: row.class ?? null,
            teacher: row.teacher ?? null,
            subject: row.subject ?? null,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
        }));

        return {
            success: true,
            message: messages.annualSchedule.deleteSuccess,
            deleted,
        };

    } catch (error) {
        console.error("Error deleting annual schedule entry:", error);
        return {
            success: false,
            message: messages.annualSchedule.deleteError,
        };
    }
}
