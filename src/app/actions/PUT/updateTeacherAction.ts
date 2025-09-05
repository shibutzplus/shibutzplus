"use server";

import { TeacherType, TeacherRequest } from "@/models/types/teachers";
import { ActionResponse } from "@/models/types/actions";
import { checkAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { db, schema, executeQuery } from "@/db";
import { eq } from "drizzle-orm";
import { getTeachersAction } from "../GET/getTeachersAction";

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

        const updatedTeacher = await executeQuery(async () => {
            return (
                await db
                    .update(schema.teachers)
                    .set({
                        name: teacherData.name,
                        role: teacherData.role,
                        userId: teacherData.userId,
                        updatedAt: new Date(),
                    })
                    .where(eq(schema.teachers.id, teacherId))
                    .returning()
            )[0];
        });

        if (!updatedTeacher) {
            return { success: false, message: messages.teachers.updateError };
        }

        const allTeachersResp = await getTeachersAction(teacherData.schoolId);
        return {
            success: true,
            message: messages.teachers.updateSuccess,
            data: allTeachersResp.data || [],
        };
    } catch (error) {
        console.error("Error updating teacher:", error);
        return { success: false, message: messages.common.serverError };
    }
}
