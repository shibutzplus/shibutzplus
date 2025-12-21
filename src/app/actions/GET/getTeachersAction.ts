"use server";

import { GetTeachersResponse, TeacherRoleValues } from "@/models/types/teachers";
import { checkAuthAndParams, publicAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { db, schema, executeQuery } from "@/db";
import { eq, ne, and, asc } from "drizzle-orm";

export async function getTeachersAction(
    schoolId: string,
    options: { isPrivate: boolean; hasSub: boolean } = { isPrivate: true, hasSub: true },
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
            if (options.hasSub) {
                return await db
                    .select()
                    .from(schema.teachers)
                    .where(eq(schema.teachers.schoolId, schoolId))
                    .orderBy(asc(schema.teachers.name));
            } else {
                return await db
                    .select()
                    .from(schema.teachers)
                    .where(
                        and(
                            eq(schema.teachers.schoolId, schoolId),
                            ne(schema.teachers.role, TeacherRoleValues.SUBSTITUTE),
                        ),
                    )
                    .orderBy(asc(schema.teachers.name));
            }
        });

        if (!teachers || teachers.length === 0) {
            return { success: true, message: messages.teachers.success, data: [] };
        }

        return { success: true, message: messages.teachers.success, data: teachers };
    } catch (error) {
        console.error("Error fetching all teachers:", error);
        return { success: false, message: messages.common.serverError };
    }
}
