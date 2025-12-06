"use server";

import { db, schema, executeQuery } from "@/db";
import { ClassType, ClassRequest } from "@/models/types/classes";
import { ActionResponse } from "@/models/types/actions";
import { checkAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";

export async function addClassAction(
    classData: ClassRequest,
): Promise<ActionResponse & { data?: ClassType; errorCode?: string }> {
    try {
        const authError = await checkAuthAndParams({
            name: classData.name,
            schoolId: classData.schoolId,
        });
        if (authError) return authError as ActionResponse;

        const newClass = await executeQuery(async () => {
            return (await db.insert(schema.classes).values(classData).returning())[0];
        });

        if (!newClass) {
            return { success: false, message: messages.classes.createError };
        }

        return {
            success: true,
            message: messages.classes.createSuccess,
            data: newClass,
        };
    } catch (error: any) {
        const pgCode = error?.code ?? error?.cause?.code ?? error?.originalError?.code;
        if (pgCode === "23505") {
            const entityName = classData.activity ? "קבוצה" : "כיתה";
            return {
                success: false,
                errorCode: "23505",
                message: `${entityName} בשם הזה כבר קיימת בבית הספר`,
            };
        }
        return { success: false, message: messages.common.serverError };
    }
}
