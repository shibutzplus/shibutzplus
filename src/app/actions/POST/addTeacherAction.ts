"use server";

import { TeacherType, TeacherRequest } from "@/models/types/teachers";
import { ActionResponse } from "@/models/types/actions";
import { checkAuthAndParams, checkIsNotGuest } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { db, schema, executeQuery } from "@/db";
import { NewTeacherSchema } from "@/db/schema";
import { teacherSchema } from "@/models/validation/teacher";

export async function addTeacherAction(
    teacherData: TeacherRequest,
): Promise<ActionResponse & { data?: TeacherType; errorCode?: string }> {
    try {
        const validation = teacherSchema.safeParse(teacherData);
        if (!validation.success) {
            return {
                success: false,
                message: validation.error.issues[0]?.message || "נתונים לא תקינים",
            };
        }

        const guestError = await checkIsNotGuest();
        if (guestError) {
            return guestError as ActionResponse;
        }

        const authError = await checkAuthAndParams({
            name: teacherData.name,
            role: teacherData.role,
            schoolId: teacherData.schoolId,
        });
        if (authError) {
            return authError as ActionResponse;
        }

        const newTeacher = await executeQuery(async () => {
            return (
                await db
                    .insert(schema.teachers)
                    .values(teacherData as NewTeacherSchema)
                    .returning()
            )[0];
        });

        if (!newTeacher) {
            return {
                success: false,
                message: messages.teachers.createError,
            };
        }

        return {
            success: true,
            message: messages.teachers.createSuccess,
            data: newTeacher,
        };
    } catch (error: any) {
        const pgCode = error?.code ?? error?.cause?.code ?? error?.originalError?.code;
        if (pgCode === "23505") {
            return {
                success: false,
                errorCode: "23505",
                message: "מורה בשם הזה כבר קיים בבית הספר",
            };
        }

        return { success: false, message: messages.common.serverError };
    }
}
