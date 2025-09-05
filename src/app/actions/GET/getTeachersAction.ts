"use server";

import { checkAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { db, schema, executeQuery } from "@/db";
import { eq } from "drizzle-orm";

export type PublicTeacher = {
    id: string;
    name: string;
};

export type GetTeachersResponse = {
    success: boolean;
    message: string;
    data?: PublicTeacher[];
};

export async function getTeachersAction(
    schoolId: string,
    opts?: { allowUnauthedPortal?: boolean }
): Promise<GetTeachersResponse> {
    try {
        if (!opts?.allowUnauthedPortal) {
            const authError = await checkAuthAndParams({ schoolId });
            if (authError) {
                return authError as GetTeachersResponse;
            }
        }

        const teachers = await executeQuery(async () => {
            return await db
                .select({
                    id: schema.teachers.id,
                    name: schema.teachers.name,
                })
                .from(schema.teachers)
                .where(eq(schema.teachers.schoolId, schoolId))
                .orderBy(schema.teachers.name);
        });

        if (!teachers || teachers.length === 0) {
            return { success: false, message: messages.teachers.error };
        }

        return {
            success: true,
            message: messages.teachers.success,
            data: teachers,
        };
    } catch (error) {
        console.error("Error fetching teachers ID+Name:", error);
        return { success: false, message: messages.common.serverError };
    }
}
