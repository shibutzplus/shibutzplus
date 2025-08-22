"use server";

import { SubjectType, SubjectRequest } from "@/models/types/subjects";
import { ActionResponse } from "@/models/types/actions";
import { checkAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { getSubjectsAction } from "@/app/actions/GET/getSubjectsAction";

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

        const updatedSubject = (await db
            .update(schema.subjects)
            .set({
                name: subjectData.name,
                updatedAt: new Date(),
            })
            .where(eq(schema.subjects.id, subjectId))
            .returning())[0];

        if (!updatedSubject) {
            return {
                success: false,
                message: messages.subjects.updateError,
            };
        }

        // Fetch all subjects for the updated subject's school
        const allSubjectsResp = await getSubjectsAction(subjectData.schoolId);
        return {
            success: true,
            message: messages.subjects.updateSuccess,
            data: allSubjectsResp.data || [],
        };

    } catch (error) {
        console.error("Error updating subject:", error);
        return {
            success: false,
            message: messages.subjects.updateError,
        };
    }
}
