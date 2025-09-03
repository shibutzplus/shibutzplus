"use server";

import { GetTeachersResponse } from "@/models/types/teachers";
import { checkAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { db, schema, executeQuery } from "@/db";
import { eq } from "drizzle-orm";

export async function getTeachersAction(schoolId: string): Promise<GetTeachersResponse> {
    try {
        const authError = await checkAuthAndParams({ schoolId });
        if (authError) {
            return authError as GetTeachersResponse;
        }

        // get the teachers withSub or withoutSub
        const teachers = await executeQuery(async () => {
            return await db
                .select()
                .from(schema.teachers)
                .where(eq(schema.teachers.schoolId, schoolId)) 
                .orderBy(schema.teachers.name);
        });

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
