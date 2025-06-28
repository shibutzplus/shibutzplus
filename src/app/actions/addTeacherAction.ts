"use server";

import { TeacherType, TeacherRequest } from "@/models/types/teachers";
import { ActionResponse } from "@/models/types/actions";
import { checkAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { db, schema } from "@/db";
import { NewTeacherSchema } from "@/db/schema";

export async function addTeacherAction(
    teacherData: TeacherRequest,
): Promise<ActionResponse & { data?: TeacherType }> {
    try {
        const authError = await checkAuthAndParams({
            name: teacherData.name,
            role: teacherData.role,
            schoolId: teacherData.schoolId,
        });

        if (authError) {
            return authError as ActionResponse;
        }

        const newTeacher = (
            await db
                .insert(schema.teachers)
                .values(teacherData as NewTeacherSchema)
                .returning()
        )[0];

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
    } catch (error) {
        console.error("Error creating teacher:", error);
        return {
            success: false,
            message: messages.teachers.createError,
        };
    }
}
