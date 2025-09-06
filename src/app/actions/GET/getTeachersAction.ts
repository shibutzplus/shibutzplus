"use server";

import { GetTeachersResponse } from "@/models/types/teachers";
import { checkAuthAndParams, publicAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { db, schema, executeQuery } from "@/db";
import { eq } from "drizzle-orm";

export async function getTeachersAction(
    schoolId: string,
    options: { isPrivate: boolean } = { isPrivate: true },
): Promise<GetTeachersResponse> {
    try {
        let authError;
        if (options.isPrivate) {
            authError = await checkAuthAndParams({ schoolId });
        } else {
            authError = await publicAuthAndParams({ schoolId });
        }
        if (authError) return authError as GetTeachersResponse;

        const teachers = await executeQuery(async () => {
            return await db
                .select()
                .from(schema.teachers)
                .where(eq(schema.teachers.schoolId, schoolId))
                .orderBy(schema.teachers.name);
        });

        if (!teachers || teachers.length === 0) {
            return { success: false, message: messages.teachers.error };
        }

        return { success: true, message: messages.teachers.success, data: teachers };
    } catch (error) {
        console.error("Error fetching all teachers:", error);
        return { success: false, message: messages.common.serverError };
    }
}
