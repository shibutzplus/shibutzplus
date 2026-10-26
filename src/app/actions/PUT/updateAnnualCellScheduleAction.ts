"use server";

import { ActionResponse } from "@/models/types/actions";
import { AnnualScheduleType } from "@/models/types/annualSchedule";
import { checkAuthAndParams, checkIsNotGuest } from "@/utils/authUtils";
import { db, schema, executeQuery } from "@/db";
import { and, eq, inArray } from "drizzle-orm";
import { dbLog } from "@/services/loggerService";
import { clearAnnualScheduleCache } from "@/services/schedule/getAnnualSchedule";
import { clearAnnualAltScheduleCache } from "@/app/actions/GET/getAnnualAltAction";
import messages from "@/resources/messages";

export interface AnnualCellAssignmentInput {
    teacherId: string;
    classId: string;
    subjectId: string;
}

export interface UpdateAnnualCellScheduleParams {
    day: number;
    hour: number;
    schoolId: string;
    selectedClassId?: string;
    selectedTeacherId?: string;
    assignments: AnnualCellAssignmentInput[];
    isAlt?: boolean;
}

export async function updateAnnualCellScheduleAction(
    params: UpdateAnnualCellScheduleParams
): Promise<ActionResponse & { deleted?: AnnualScheduleType[]; added?: AnnualScheduleType[] }> {
    const { day, hour, schoolId, selectedClassId, selectedTeacherId, assignments, isAlt } = params;

    try {
        const authError = await checkAuthAndParams({
            day,
            hour,
            schoolId,
        });
        if (authError) {
            return authError as ActionResponse;
        }

        const guestError = await checkIsNotGuest();
        if (guestError) {
            return guestError as ActionResponse;
        }

        const targetTable = isAlt ? schema.annualScheduleAlt : schema.annualSchedule;
        const queryTarget = isAlt ? db.query.annualScheduleAlt : db.query.annualSchedule;

        const result = await executeQuery(async () => {
            // 1. Identify which cell's rows we are editing
            const conditions = [
                eq(targetTable.day, day),
                eq(targetTable.hour, hour),
                eq(targetTable.schoolId, schoolId),
            ];

            if (selectedClassId) {
                conditions.push(eq(targetTable.classId, selectedClassId));
            } else if (selectedTeacherId) {
                conditions.push(eq(targetTable.teacherId, selectedTeacherId));
            }

            // 2. Fetch existing rows to delete
            const toDeleteRows = await queryTarget.findMany({
                where: and(...conditions),
                with: {
                    school: true,
                    class: true,
                    teacher: true,
                    subject: true,
                },
            });

            // 3. Delete existing rows
            if (toDeleteRows && toDeleteRows.length > 0) {
                const toDeleteIds = toDeleteRows.map((r) => r.id);
                await db
                    .delete(targetTable)
                    .where(inArray(targetTable.id, toDeleteIds));
            }

            // 4. Prepare new valid assignments (filter out incomplete rows & deduplicate)
            const seenAssignments = new Set<string>();
            const validAssignments = (assignments || []).filter((a) => {
                if (!a.teacherId || !a.classId || !a.subjectId) return false;
                const key = `${a.teacherId}|${a.classId}|${a.subjectId}`;
                if (seenAssignments.has(key)) return false;
                seenAssignments.add(key);
                return true;
            });

            let addedPopulatedRows: any[] = [];
            if (validAssignments.length > 0) {
                const newRows = validAssignments.map((a) => ({
                    day,
                    hour,
                    schoolId,
                    classId: a.classId,
                    teacherId: a.teacherId,
                    subjectId: a.subjectId,
                }));

                const insertedRows = await db
                    .insert(targetTable)
                    .values(newRows)
                    .returning();

                if (insertedRows && insertedRows.length > 0) {
                    const insertedIds = insertedRows.map((row) => row.id);
                    addedPopulatedRows = await queryTarget.findMany({
                        where: inArray(targetTable.id, insertedIds),
                        with: {
                            school: true,
                            class: true,
                            teacher: true,
                            subject: true,
                        },
                    });
                }
            }

            return { deleted: toDeleteRows, added: addedPopulatedRows };
        });

        // 5. Map rows for client context consumption
        const deleted: AnnualScheduleType[] = (result?.deleted || []).map((row: any) => ({
            id: row.id,
            day: row.day,
            hour: row.hour,
            schoolId: row.schoolId ?? row.school?.id,
            classId: row.classId ?? row.class?.id,
            teacherId: row.teacherId ?? row.teacher?.id,
            subjectId: row.subjectId ?? row.subject?.id,
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
            schoolId: row.schoolId ?? row.school?.id,
            classId: row.classId ?? row.class?.id,
            teacherId: row.teacherId ?? row.teacher?.id,
            subjectId: row.subjectId ?? row.subject?.id,
            school: row.school ?? null,
            class: row.class ?? null,
            teacher: row.teacher ?? null,
            subject: row.subject ?? null,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
        }));

        // 6. Clear schedule cache for this school
        if (isAlt) {
            await clearAnnualAltScheduleCache(schoolId);
        } else {
            clearAnnualScheduleCache(schoolId);
        }

        return {
            success: true,
            deleted,
            added,
        };
    } catch (error) {
        dbLog({
            description: `Error updating annual cell schedule entry: ${error instanceof Error ? error.message : String(error)}`,
            schoolId,
        });
        return {
            success: false,
            message: messages.annualSchedule.updateError,
        };
    }
}
