"use server";

import { SubjectType, SubjectRequest } from "@/models/types/subjects";
import { ActionResponse } from "@/models/types/actions";
import { checkAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { db, schema, executeQuery } from "@/db";
import { NewSubjectSchema } from "@/db/schema";
import { subjectSchema } from "@/models/validation/subject";

export async function addSubjectAction(
    subjectData: SubjectRequest,
): Promise<ActionResponse & { data?: SubjectType; errorCode?: string }> {
    try {
        const validation = subjectSchema.safeParse(subjectData);
        if (!validation.success) {
            return {
                success: false,
                message: validation.error.issues[0]?.message || "נתונים לא תקינים",
            };
        }

        const authError = await checkAuthAndParams({
            name: subjectData.name,
            schoolId: subjectData.schoolId,
        });
        if (authError) return authError as ActionResponse;

        const newSubject = await executeQuery(async () => {
            return (
                await db
                    .insert(schema.subjects)
                    .values(subjectData as NewSubjectSchema)
                    .returning()
            )[0];
        });

        if (!newSubject) {
            return { success: false, message: messages.subjects.createError };
        }

        return {
            success: true,
            message: messages.subjects.createSuccess,
            data: newSubject,
        };
    } catch (error: any) {
        const pgCode = error?.code ?? error?.cause?.code ?? error?.originalError?.code;
        if (pgCode === "23505") {
            return {
                success: false,
                errorCode: "23505",
                message: "מקצוע בשם הזה כבר קיים בבית הספר",
            };
        }
        return { success: false, message: messages.common.serverError };
    }
}
