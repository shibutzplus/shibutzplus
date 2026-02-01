"use server";

import { SubjectType, SubjectRequest } from "@/models/types/subjects";
import { ActionResponse } from "@/models/types/actions";
import { checkAuthAndParams, checkIsNotGuest } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { db, schema, executeQuery } from "@/db";
import { eq } from "drizzle-orm";
import { getSubjectsAction } from "@/app/actions/GET/getSubjectsAction";
import { dbLog } from "@/services/loggerService";
import { pushSyncUpdateServer } from "@/services/sync/serverSyncService";
import { ENTITIES_DATA_CHANGED } from "@/models/constant/sync";

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

        // Fetch all subjects for the updated subject's school
        const allSubjectsResp = await getSubjectsAction(subjectData.schoolId);

        void pushSyncUpdateServer(ENTITIES_DATA_CHANGED, { schoolId: subjectData.schoolId });

        return {
            success: true,
            message: messages.subjects.updateSuccess,
            data: allSubjectsResp.data || [],
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
