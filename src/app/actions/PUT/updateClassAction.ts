"use server";

import { ClassType, ClassRequest } from "@/models/types/classes";
import { ActionResponse } from "@/models/types/actions";
import { checkAuthAndParams, checkIsNotGuest } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { db, schema, executeQuery } from "@/db";
import { eq, and, asc, sql } from "drizzle-orm";
import { dbLog } from "@/services/loggerService";
import { pushSyncUpdateServer } from "@/services/sync/serverSyncService";
import { ENTITIES_DATA_CHANGED } from "@/models/constant/sync";
import { revalidateTag } from "next/cache";
import { cacheTags } from "@/lib/cacheTags";

export async function updateClassAction(
    classId: string,
    classData: ClassRequest,
): Promise<ActionResponse & { data?: ClassType[] }> {
    try {
        const authError = await checkAuthAndParams({
            classId,
            name: classData.name,
            schoolId: classData.schoolId,
        });

        if (authError) {
            return authError as ActionResponse;
        }

        const guestError = await checkIsNotGuest();
        if (guestError) {
            return guestError as ActionResponse;
        }

        // Check if a class/group with the same name already exists (excluding the current one)
        const existingClass = await executeQuery(async () => {
            return await db.query.classes.findFirst({
                where: (classes, { and, eq, ne }) =>
                    and(
                        eq(classes.schoolId, classData.schoolId),
                        eq(classes.name, classData.name),
                        ne(classes.id, classId)
                    ),
            });
        });

        if (existingClass) {
            return {
                success: false,
                message: "שם זה כבר קיים במערכת",
            };
        }

        const currentClass = await executeQuery(async () => {
            return (
                await db
                    .select({ name: schema.classes.name })
                    .from(schema.classes)
                    .where(eq(schema.classes.id, classId))
                    .limit(1)
            )[0];
        });

        const oldName = currentClass?.name;
        const isNameChanged = !!oldName && oldName !== classData.name;

        const updatedClass = await executeQuery(async () => {
            return (
                await db
                    .update(schema.classes)
                    .set({
                        name: classData.name,
                        updatedAt: new Date(),
                    })
                    .where(eq(schema.classes.id, classId))
                    .returning()
            )[0];
        });

        if (!updatedClass) {
            return {
                success: false,
                message: messages.classes.updateError,
            };
        }

        // If class name was changed, cascade update to history table for data continuity
        if (isNameChanged && oldName) {
            await executeQuery(async () => {
                await db.execute(sql`
                    UPDATE ${schema.history}
                    SET ${schema.history.classes} = (
                        SELECT string_agg(CASE WHEN elem = ${oldName} THEN ${classData.name} ELSE elem END, ', ')
                        FROM unnest(string_to_array(${schema.history.classes}, ', ')) AS elem
                    ),
                    ${schema.history.updatedAt} = NOW()
                    WHERE ${schema.history.schoolId} = ${classData.schoolId}
                      AND ${schema.history.classes} IS NOT NULL
                      AND ${oldName} = ANY(string_to_array(${schema.history.classes}, ', '))
                `);
            });

            revalidateTag(cacheTags.history(classData.schoolId));
        }

        // Fetch all classes for the updated class's school directly to bypass cache for the immediate response
        const allClasses = await executeQuery(async () => {
            return await db
                .select()
                .from(schema.classes)
                .where(and(eq(schema.classes.schoolId, classData.schoolId), eq(schema.classes.isActive, true)))
                .orderBy(asc(schema.classes.activity), asc(schema.classes.name));
        });

        // Invalidate cache - class changes affect schedules AND lists
        revalidateTag(cacheTags.classesList(classData.schoolId));
        revalidateTag(cacheTags.schoolSchedule(classData.schoolId));

        void pushSyncUpdateServer(ENTITIES_DATA_CHANGED, { schoolId: classData.schoolId });

        return {
            success: true,
            message: messages.classes.updateClassSuccess,
            data: (allClasses as ClassType[]) || [],
        };
    } catch (error) {
        // Check if it's a unique constraint violation
        const errorMessage = error instanceof Error ? error.message : String(error);
        const isDuplicateError = errorMessage.includes('unique') || errorMessage.includes('duplicate');

        dbLog({
            description: `Error updating class: ${errorMessage}`,
            schoolId: classData.schoolId,
            metadata: { classId }
        });
        return {
            success: false,
            message: isDuplicateError ? "שם זה כבר קיים במערכת" : messages.common.serverError,
        };
    }
}
