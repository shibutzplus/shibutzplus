"use server";

import { GetTeachersResponse, TeacherRoleValues } from "@/models/types/teachers";
import { checkAuthAndParams, publicAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { db, schema, executeQuery } from "@/db";
import { eq, and, asc } from "drizzle-orm";
import { dbLog } from "@/services/loggerService";

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
                            eq(schema.teachers.role, TeacherRoleValues.REGULAR),
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
        dbLog({
            description: `Error fetching all teachers: ${error instanceof Error ? error.message : String(error)}`,
            schoolId
        });
        return { success: false, message: messages.common.serverError };
    }
}
