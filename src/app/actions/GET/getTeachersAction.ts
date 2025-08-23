"use server";

import { GetTeachersResponse } from "@/models/types/teachers";
import { checkAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";

export async function getTeachersAction(schoolId: string): Promise<GetTeachersResponse> {
    try {
        const authError = await checkAuthAndParams({ schoolId });
        if (authError) {
            return authError as GetTeachersResponse;
        }

        const teachers = await db
            .select()
            .from(schema.teachers)
            .where(eq(schema.teachers.schoolId, schoolId));

        if (!teachers || teachers.length === 0) {
            return {
                success: false,
                message: messages.teachers.error,
            };
        }

        return {
            success: true,
            message: messages.teachers.success,
            data: teachers,
        };
    } catch (error) {
        console.error("Error fetching teachers:", error);
        return {
            success: false,
            message: messages.common.serverError,
        };
    }
}
