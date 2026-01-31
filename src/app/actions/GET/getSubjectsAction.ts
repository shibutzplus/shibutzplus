"use server";

import { GetSubjectsResponse } from "@/models/types/subjects";
import { checkAuthAndParams, publicAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { db, schema, executeQuery } from "@/db";
import { eq, asc } from "drizzle-orm";
import { dbLog } from "@/services/loggerService";

export async function getSubjectsAction(
    schoolId: string,
    options: { isPrivate: boolean } = { isPrivate: true },
): Promise<GetSubjectsResponse> {
    try {
        let authError;
        if (options.isPrivate) {
            authError = await checkAuthAndParams({ schoolId });
        } else {
            authError = await publicAuthAndParams({ schoolId });
        }

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
        dbLog({ description: `Error fetching subjects: ${error instanceof Error ? error.message : String(error)}`, schoolId });
        return {
            success: false,
            message: messages.common.serverError,
        };
    }
}
