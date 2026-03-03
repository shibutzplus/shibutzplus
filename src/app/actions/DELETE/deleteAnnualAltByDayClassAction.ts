"use server";

import { ActionResponse } from "@/models/types/actions";
import { AnnualScheduleType } from "@/models/types/annualSchedule";
import { checkAuthAndParams, checkIsNotGuest } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { db, schema, executeQuery } from "@/db";
import { eq, and } from "drizzle-orm";
import { dbLog } from "@/services/loggerService";
import { revalidateTag } from "next/cache";
import { cacheTags } from "@/lib/cacheTags";

export const deleteAnnualAltByDayClassAction = async (
    day: number,
    hour: number,
    classId: string,
    schoolId: string,
): Promise<ActionResponse & { deleted?: AnnualScheduleType[] }> => {
    try {
        const authError = await checkAuthAndParams({
            day,
            hour,
        });
        if (authError) {
            return authError as ActionResponse;
        }

        const guestError = await checkIsNotGuest();
        if (guestError) {
            return guestError as ActionResponse;
        }

        const toDeleteRows = await executeQuery(async () => {
            const rows = await db.query.annualScheduleAlt.findMany({
                where: and(
                    eq(schema.annualScheduleAlt.day, day),
                    eq(schema.annualScheduleAlt.hour, hour),
                    eq(schema.annualScheduleAlt.classId, classId),
                    eq(schema.annualScheduleAlt.schoolId, schoolId),
                ),
                with: {
                    school: true,
                    class: true,
                    teacher: true,
                    subject: true,
                },
            });

            if (!rows || rows.length === 0) {
                return null;
            }

            await db
                .delete(schema.annualScheduleAlt)
                .where(
                    and(
                        eq(schema.annualScheduleAlt.day, day),
                        eq(schema.annualScheduleAlt.hour, hour),
                        eq(schema.annualScheduleAlt.classId, classId),
                        eq(schema.annualScheduleAlt.schoolId, schoolId),
                    ),
                );

            return rows;
        });

        if (!toDeleteRows) {
            return {
                success: false,
                message: "Alt schedule entries not found.",
            };
        }

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

        revalidateTag(cacheTags.annualAltSchedule(schoolId));

        return {
            success: true,
            message: messages.annualSchedule.deleteSuccess,
            deleted,
        };
    } catch (error) {
        dbLog({ description: `Error deleting alt schedule entry: ${error instanceof Error ? error.message : String(error)}`, schoolId });
        return {
            success: false,
            message: messages.annualSchedule.deleteError,
        };
    }
}
