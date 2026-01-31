"use server";

import { TeacherType, TeacherRequest } from "@/models/types/teachers";
import { ActionResponse } from "@/models/types/actions";
import { checkAuthAndParams, checkIsNotGuest } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { db, schema, executeQuery } from "@/db";
import { eq } from "drizzle-orm";
import { dbLog } from "@/services/loggerService";

export async function updateTeacherAction(
    teacherId: string,
    teacherData: TeacherRequest,
): Promise<ActionResponse & { data?: TeacherType[] }> {
    try {
        const authError = await checkAuthAndParams({
            teacherId,
            name: teacherData.name,
            role: teacherData.role,
            schoolId: teacherData.schoolId,
        });
        if (authError) return authError as ActionResponse;

        const guestError = await checkIsNotGuest();
        if (guestError) {
            return guestError as ActionResponse;
        }

        const updatedTeacher = await executeQuery(async () => {
            return (
                await db
                    .update(schema.teachers)
                    .set({
                        name: teacherData.name,
                        role: teacherData.role,
                        updatedAt: new Date(),
                    })
                    .where(eq(schema.teachers.id, teacherId))
                    .returning()
            )[0];
        });

        if (!updatedTeacher) {
            return { success: false, message: messages.teachers.updateError };
        }

        const allTeachersResp = await executeQuery(async () => {
            return await db
                .select()
                .from(schema.teachers)
                .where(eq(schema.teachers.schoolId, teacherData.schoolId))
                .orderBy(schema.teachers.name);
        });

        return {
            success: true,
            message: messages.teachers.updateSuccess,
            data: allTeachersResp || [],
        };
    } catch (error) {
        dbLog({
            description: `Error updating teacher: ${error instanceof Error ? error.message : String(error)}`,
            schoolId: teacherData.schoolId,
            user: teacherId
        });
        return { success: false, message: messages.common.serverError };
    }
}
