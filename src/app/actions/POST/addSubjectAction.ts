"use server";

import { SubjectType, SubjectRequest } from "@/models/types/subjects";
import { ActionResponse } from "@/models/types/actions";
import { checkAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { db, schema, executeQuery } from "@/db";
import { NewSubjectSchema } from "@/db/schema";

export async function addSubjectAction(
    subjectData: SubjectRequest,
): Promise<ActionResponse & { data?: SubjectType }> {
    try {
        const authError = await checkAuthAndParams({
            name: subjectData.name,
            schoolId: subjectData.schoolId,
        });

        if (authError) {
            return authError as ActionResponse;
        }

        const newSubject = await executeQuery(async () => {
            return (await db
                .insert(schema.subjects)
                .values(subjectData as NewSubjectSchema)
                .returning())[0];
        });

        if (!newSubject) {
            return {
                success: false,
                message: messages.subjects.createError,
            };
        }

        return {
            success: true,
            message: messages.subjects.createSuccess,
            data: newSubject,
        };
    } catch (error) {
        console.error("Error creating subject:", error);
        return {
            success: false,
            message: messages.common.serverError,
        };
    }
}
