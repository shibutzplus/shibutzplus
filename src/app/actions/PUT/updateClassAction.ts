"use server";

import { ClassType, ClassRequest } from "@/models/types/classes";
import { ActionResponse } from "@/models/types/actions";
import { checkAuthAndParams, checkIsNotGuest } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { db, schema, executeQuery } from "@/db";
import { eq } from "drizzle-orm";
import { getClassesAction } from "../GET/getClassesAction";
import { dbLog } from "@/services/loggerService";
import { pushSyncUpdateServer } from "@/services/sync/serverSyncService";
import { ENTITIES_DATA_CHANGED } from "@/models/constant/sync";

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

        // Fetch all classes for the updated class's school
        const allClassesResp = await getClassesAction(classData.schoolId);

        void pushSyncUpdateServer(ENTITIES_DATA_CHANGED, { schoolId: classData.schoolId });

        return {
            success: true,
            message: messages.classes.updateClassSuccess,
            data: allClassesResp.data || [],
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
