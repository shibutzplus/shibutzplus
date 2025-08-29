"use server";

import { db, schema, executeQuery } from "@/db";
import { ClassType, ClassRequest } from "@/models/types/classes";
import { ActionResponse } from "@/models/types/actions";
import { checkAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";

export async function addClassAction(
    classData: ClassRequest,
): Promise<ActionResponse & { data?: ClassType }> {
    try {
        // Check authentication and required parameters
        const authError = await checkAuthAndParams({
            name: classData.name,
            schoolId: classData.schoolId,
        });

        if (authError) {
            return authError as ActionResponse;
        }

        // Create the class in the database
        const newClass = await executeQuery(async () => {
            return (await db.insert(schema.classes).values(classData).returning())[0];
        });

        if (!newClass) {
            return {
                success: false,
                message: messages.classes.createError,
            };
        }

        return {
            success: true,
            message: messages.classes.createSuccess,
            data: newClass,
        };
    } catch (error) {
        console.error("Error creating class:", error);
        return {
            success: false,
            message: messages.common.serverError,
        };
    }
}
