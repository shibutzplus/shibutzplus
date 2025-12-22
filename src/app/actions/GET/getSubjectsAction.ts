"use server";

import { GetSubjectsResponse } from "@/models/types/subjects";
import { checkAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { db, schema, executeQuery } from "@/db";
import { eq, asc } from "drizzle-orm";

export async function getSubjectsAction(schoolId: string): Promise<GetSubjectsResponse> {
    try {
        const authError = await checkAuthAndParams({ schoolId });
        if (authError) {
            return authError as GetSubjectsResponse;
        }

        const subjects = await executeQuery(async () => {
            return await db
                .select()
                .from(schema.subjects)
                .where(eq(schema.subjects.schoolId, schoolId))
                .orderBy(asc(schema.subjects.name));
        });

        if (!subjects || subjects.length === 0) {
            return {
                success: true,
                message: messages.subjects.success,
                data: [],
            };
        }

        return {
            success: true,
            message: messages.subjects.success,
            data: subjects,
        };
    } catch (error) {
        console.error("Error fetching subjects:", error);
        return {
            success: false,
            message: messages.common.serverError,
        };
    }
}
