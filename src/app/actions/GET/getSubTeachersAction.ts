"use server";

import { GetTeachersResponse, TeacherRoleValues } from "@/models/types/teachers";
import { checkAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { db, schema } from "@/db";
import { and, eq } from "drizzle-orm";

export async function getSubTeachersAction(schoolId: string): Promise<GetTeachersResponse> {
    try {
        const authError = await checkAuthAndParams({ schoolId });
        if (authError) {
            return authError as GetTeachersResponse;
        }

        const subTeachers = await db
            .select()
            .from(schema.teachers)
            .where(
                and(
                    eq(schema.teachers.schoolId, schoolId),
                    eq(schema.teachers.role, TeacherRoleValues.SUBSTITUTE)
                )
            );

        return {
            success: true,
            message: messages.teachers.success,
            data: subTeachers || [],
        };
    } catch (error) {
        console.error("Error fetching substitute teachers:", error);
        return {
            success: false,
            message: messages.common.serverError,
        };
    }
}