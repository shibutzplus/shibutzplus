"use server";

import { ClassType, ClassRequest } from "@/models/types/classes";
import { ActionResponse } from "@/models/types/actions";
import { checkAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";

export async function updateClassAction(
    classId: string,
    classData: ClassRequest,
): Promise<ActionResponse & { data?: ClassType }> {
    try {
        const authError = await checkAuthAndParams({
            classId,
            name: classData.name,
            schoolId: classData.schoolId,
        });

        if (authError) {
            return authError as ActionResponse;
        }

        const updatedClass = (await db
            .update(schema.classes)
            .set({
                name: classData.name,
                updatedAt: new Date(),
            })
            .where(eq(schema.classes.id, classId))
            .returning())[0];

        if (!updatedClass) {
            return {
                success: false,
                message: messages.classes.updateError,
            };
        }

        return {
            success: true,
            message: messages.classes.updateSuccess,
            data: updatedClass,
        };
    } catch (error) {
        console.error("Error updating class:", error);
        return {
            success: false,
            message: messages.classes.updateError,
        };
    }
}
