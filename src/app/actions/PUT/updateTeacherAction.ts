"use server";

import { TeacherType, TeacherRequest } from "@/models/types/teachers";
import { ActionResponse } from "@/models/types/actions";
import { checkAuthAndParams, checkIsNotGuest } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { db, schema, executeQuery } from "@/db";
import { eq, and, isNull, gte } from "drizzle-orm";
import { dbLog } from "@/services/loggerService";
import { pushSyncUpdateServer } from "@/services/sync/serverSyncService";
import { ENTITIES_DATA_CHANGED } from "@/models/constant/sync";
import { revalidateTag } from "next/cache";
import { cacheTags } from "@/lib/cacheTags";

export async function updateTeacherAction(
    teacherId: string,
    teacherData: TeacherRequest,
): Promise<ActionResponse & { data?: TeacherType[]; hasMatchingDailyText?: boolean }> {
    try {
        const authError = await checkAuthAndParams({
            teacherId,
            name: teacherData.name,
            role: teacherData.role,
            schoolId: teacherData.schoolId,
        });
        if (authError) return authError as ActionResponse;

        const guestError = await checkIsNotGuest();
        if (guestError) {
            return guestError as ActionResponse;
        }

        const existingTeacher = await executeQuery(async () => {
            return (
                await db
                    .select({ name: schema.teachers.name })
                    .from(schema.teachers)
                    .where(eq(schema.teachers.id, teacherId))
                    .limit(1)
            )[0];
        });

        const oldName = existingTeacher?.name;
        const isNameChanged = !!oldName && oldName !== teacherData.name;

        let targetTeacherId = teacherId;

        // Check if a teacher with the target name already exists (excluding current)
        if (isNameChanged) {
            const conflicting = await executeQuery(async () => {
                return await db.query.teachers.findFirst({
                    where: (t, { and, eq, ne }) =>
                        and(
                            eq(t.schoolId, teacherData.schoolId),
                            eq(t.name, teacherData.name),
                            ne(t.id, teacherId)
                        ),
                });
            });

            if (conflicting) {
                if (conflicting.isActive) {
                    return { success: false, message: "שם זה כבר קיים במערכת" };
                }

                // Inactive record with target name exists → merge into conflicting record and reactivate it
                await executeQuery(async () => {
                    // 1. Move all schedule references from current teacherId to conflicting.id
                    await db.update(schema.annualSchedule)
                        .set({ teacherId: conflicting.id })
                        .where(eq(schema.annualSchedule.teacherId, teacherId));

                    await db.update(schema.annualScheduleAlt)
                        .set({ teacherId: conflicting.id })
                        .where(eq(schema.annualScheduleAlt.teacherId, teacherId));

                    await db.update(schema.dailySchedule)
                        .set({ originalTeacherId: conflicting.id })
                        .where(eq(schema.dailySchedule.originalTeacherId, teacherId));

                    await db.update(schema.dailySchedule)
                        .set({ subTeacherId: conflicting.id })
                        .where(eq(schema.dailySchedule.subTeacherId, teacherId));

                    // 2. Reactivate and update role on the conflicting record
                    await db.update(schema.teachers)
                        .set({
                            role: teacherData.role,
                            isActive: true,
                            updatedAt: new Date(),
                        })
                        .where(eq(schema.teachers.id, conflicting.id));

                    // 3. Delete the temporary/current record (which now has no references)
                    await db.delete(schema.teachers)
                        .where(eq(schema.teachers.id, teacherId));
                });

                targetTeacherId = conflicting.id;
            }
        }

        if (targetTeacherId === teacherId) {
            const updatedTeacher = await executeQuery(async () => {
                return (
                    await db
                        .update(schema.teachers)
                        .set({
                            name: teacherData.name,
                            role: teacherData.role,
                            updatedAt: new Date(),
                        })
                        .where(eq(schema.teachers.id, teacherId))
                        .returning()
                )[0];
            });

            if (!updatedTeacher) {
                return { success: false, message: messages.teachers.updateError };
            }
        }

        // If teacher name was changed, cascade update to history table for data continuity
        if (isNameChanged && oldName) {
            await executeQuery(async () => {
                await db
                    .update(schema.history)
                    .set({
                        originalTeacher: teacherData.name,
                        updatedAt: new Date(),
                    })
                    .where(
                        and(
                            eq(schema.history.schoolId, teacherData.schoolId),
                            eq(schema.history.originalTeacher, oldName)
                        )
                    );

                await db
                    .update(schema.history)
                    .set({
                        subTeacher: teacherData.name,
                        updatedAt: new Date(),
                    })
                    .where(
                        and(
                            eq(schema.history.schoolId, teacherData.schoolId),
                            eq(schema.history.subTeacher, oldName)
                        )
                    );
            });

            revalidateTag(cacheTags.history(teacherData.schoolId));
        }

        const allTeachersResp = await executeQuery(async () => {
            return await db
                .select()
                .from(schema.teachers)
                .where(and(eq(schema.teachers.schoolId, teacherData.schoolId), eq(schema.teachers.isActive, true)))
                .orderBy(schema.teachers.name);
        });

        // Invalidate cache - teacher changes affect schedules AND lists
        revalidateTag(cacheTags.teachersList(teacherData.schoolId));
        revalidateTag(cacheTags.schoolSchedule(teacherData.schoolId));

        void pushSyncUpdateServer(ENTITIES_DATA_CHANGED, { schoolId: teacherData.schoolId });

        // Check for matching free text in daily schedule (Performance optimized: indexed, limited, future-only)
        const today = new Date().toISOString().split('T')[0];
        const matchingDaily = await db.select({ id: schema.dailySchedule.id })
            .from(schema.dailySchedule)
            .where(
                and(
                    eq(schema.dailySchedule.schoolId, teacherData.schoolId),
                    isNull(schema.dailySchedule.subTeacherId),
                    eq(schema.dailySchedule.event, teacherData.name.trim()),
                    gte(schema.dailySchedule.date, today)
                )
            )
            .limit(1);

        return {
            success: true,
            message: messages.teachers.updateSuccess,
            data: allTeachersResp || [],
            hasMatchingDailyText: matchingDaily.length > 0,
        };
    } catch (error) {
        dbLog({
            description: `Error updating teacher: ${error instanceof Error ? error.message : String(error)}`,
            schoolId: teacherData.schoolId,
            user: teacherId
        });
        return { success: false, message: messages.common.serverError };
    }
}
