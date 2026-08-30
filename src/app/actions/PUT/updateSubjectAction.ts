"use server";

import { SubjectType, SubjectRequest } from "@/models/types/subjects";
import { ActionResponse } from "@/models/types/actions";
import { checkAuthAndParams, checkIsNotGuest } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { db, schema, executeQuery } from "@/db";
import { eq, and, asc } from "drizzle-orm";
import { dbLog } from "@/services/loggerService";
import { pushSyncUpdateServer } from "@/services/sync/serverSyncService";
import { ENTITIES_DATA_CHANGED } from "@/models/constant/sync";
import { revalidateTag } from "next/cache";
import { cacheTags } from "@/lib/cacheTags";

export async function updateSubjectAction(
    subjectId: string,
    subjectData: SubjectRequest,
): Promise<ActionResponse & { data?: SubjectType[] }> {
    try {
        const authError = await checkAuthAndParams({
            subjectId,
            name: subjectData.name,
            schoolId: subjectData.schoolId,
        });

        if (authError) {
            return authError as ActionResponse;
        }

        const guestError = await checkIsNotGuest();
        if (guestError) {
            return guestError as ActionResponse;
        }

        const existingSubject = await executeQuery(async () => {
            return (
                await db
                    .select({ name: schema.subjects.name })
                    .from(schema.subjects)
                    .where(eq(schema.subjects.id, subjectId))
                    .limit(1)
            )[0];
        });

        const oldName = existingSubject?.name;
        const isNameChanged = !!oldName && oldName !== subjectData.name;

        if (isNameChanged) {
            const conflicting = await executeQuery(async () => {
                return await db.query.subjects.findFirst({
                    where: (s, { and, eq, ne }) =>
                        and(
                            eq(s.schoolId, subjectData.schoolId),
                            eq(s.name, subjectData.name),
                            ne(s.id, subjectId)
                        ),
                });
            });

            if (conflicting) {
                return {
                    success: false,
                    message: "שם זה כבר קיים במערכת",
                };
            }
        }

        const updatedSubject = await executeQuery(async () => {
            return (
                await db
                    .update(schema.subjects)
                    .set({
                        name: subjectData.name,
                        updatedAt: new Date(),
                    })
                    .where(eq(schema.subjects.id, subjectId))
                    .returning()
            )[0];
        });

        if (!updatedSubject) {
            return {
                success: false,
                message: messages.subjects.updateError,
            };
        }

        // If subject name was changed, cascade update to history table for data continuity
        if (isNameChanged && oldName) {
            await executeQuery(async () => {
                await db
                    .update(schema.history)
                    .set({
                        subject: subjectData.name,
                        updatedAt: new Date(),
                    })
                    .where(
                        and(
                            eq(schema.history.schoolId, subjectData.schoolId),
                            eq(schema.history.subject, oldName)
                        )
                    );
            });

            revalidateTag(cacheTags.history(subjectData.schoolId));
        }

        // Fetch all subjects for the updated subject's school directly to bypass cache for the immediate response
        const allSubjects = await executeQuery(async () => {
            return await db
                .select()
                .from(schema.subjects)
                .where(eq(schema.subjects.schoolId, subjectData.schoolId))
                .orderBy(asc(schema.subjects.name));
        });

        // Invalidate cache - subject changes affect schedules AND lists
        revalidateTag(cacheTags.subjectsList(subjectData.schoolId));
        revalidateTag(cacheTags.schoolSchedule(subjectData.schoolId));

        void pushSyncUpdateServer(ENTITIES_DATA_CHANGED, { schoolId: subjectData.schoolId });

        return {
            success: true,
            message: messages.subjects.updateSuccess,
            data: (allSubjects as SubjectType[]) || [],
        };
    } catch (error) {
        dbLog({
            description: `Error updating subject: ${error instanceof Error ? error.message : String(error)}`,
            schoolId: subjectData.schoolId,
            metadata: { subjectId }
        });
        return {
            success: false,
            message: messages.common.serverError,
        };
    }
}
