"use server";

import { ActionResponse } from "@/models/types/actions";
import { AnnualScheduleType } from "@/models/types/annualSchedule";
import { checkAuthAndParams, checkIsNotGuest } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { db, schema, executeQuery } from "@/db";
import { and, eq, inArray } from "drizzle-orm";
import { dbLog } from "@/services/loggerService";
import { revalidateTag } from "next/cache";
import { cacheTags } from "@/lib/cacheTags";
import { NewAnnualScheduleSchema } from "@/db/schema";
import { createClassSubjectPairs } from "@/services/annual/initialize";

export async function updateAnnualTeacherScheduleAction(
    day: number,
    hour: number,
    schoolId: string,
    teacherId: string,
    classIds: string[],
    subjectIds: string[]
): Promise<ActionResponse & { deleted?: AnnualScheduleType[], added?: AnnualScheduleType[] }> {
    try {
        const authError = await checkAuthAndParams({
            day,
            hour,
            schoolId,
            teacherId
        });
        if (authError) {
            return authError as ActionResponse;
        }

        const guestError = await checkIsNotGuest();
        if (guestError) {
            return guestError as ActionResponse;
        }

        const result = await executeQuery(async () => {
            // 1. Fetch matching rows from DB so we know what to delete
            const toDeleteRows = await db.query.annualSchedule.findMany({
                where: and(
                    eq(schema.annualSchedule.day, day),
                    eq(schema.annualSchedule.hour, hour),
                    eq(schema.annualSchedule.teacherId, teacherId),
                    eq(schema.annualSchedule.schoolId, schoolId),
                ),
                with: {
                    school: true,
                    class: true,
                    teacher: true,
                    subject: true,
                },
            });

            // 2. Delete all matching rows for the cell
            if (toDeleteRows && toDeleteRows.length > 0) {
                await db
                    .delete(schema.annualSchedule)
                    .where(
                        and(
                            eq(schema.annualSchedule.day, day),
                            eq(schema.annualSchedule.hour, hour),
                            eq(schema.annualSchedule.teacherId, teacherId),
                            eq(schema.annualSchedule.schoolId, schoolId),
                        ),
                    );
            }

            // 3. Prepare new pairs
            let addedPopulatedRows: any[] = [];
            if (classIds.length > 0 && subjectIds.length > 0) {
                const pairs = createClassSubjectPairs(classIds, subjectIds);
                const newRows: NewAnnualScheduleSchema[] = pairs.map(pair => ({
                    day,
                    hour,
                    schoolId,
                    teacherId,
                    classId: pair[0],
                    subjectId: pair[1]
                }));

                if (newRows.length > 0) {
                    // 4. Insert all pairs at once
                    const insertedRows = await db
                        .insert(schema.annualSchedule)
                        .values(newRows)
                        .returning();

                    // 5. Query back populated rows with relations to return to UI
                    if (insertedRows && insertedRows.length > 0) {
                        const insertedIds = insertedRows.map((row) => row.id);
                        addedPopulatedRows = await db.query.annualSchedule.findMany({
                            where: inArray(schema.annualSchedule.id, insertedIds),
                            with: {
                                school: true,
                                class: true,
                                teacher: true,
                                subject: true,
                            },
                        });
                    }
                }
            }

            return { deleted: toDeleteRows, added: addedPopulatedRows };
        });

        // 6. Map returned results properly for Context consumption
        const deleted: AnnualScheduleType[] = (result?.deleted || []).map((row: any) => ({
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

        const added: AnnualScheduleType[] = (result?.added || []).map((row: any) => ({
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

        revalidateTag(cacheTags.schoolSchedule(schoolId));

        return {
            success: true,
            // message: messages.annualSchedule.updateSuccess (If this doesn't exist just use a generic ok success msg)
            message: "השעה עודכנה בהצלחה",
            deleted,
            added,
        };
    } catch (error) {
        dbLog({ description: `Error updating annual teacher schedule entry: ${error instanceof Error ? error.message : String(error)}`, schoolId });
        return {
            success: false,
            message: messages.annualSchedule.error || "שגיאה בעדכון השעה",
        };
    }
}
