"use server";

import { GetClassesResponse } from "@/models/types/classes";
import { checkAuthAndParams, publicAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { db, schema, executeQuery } from "@/db";
import { eq, asc } from "drizzle-orm";
import { dbLog } from "@/services/loggerService";

export async function getClassesAction(
    schoolId: string,
    options: { isPrivate: boolean } = { isPrivate: true },
): Promise<GetClassesResponse> {
    try {
        let authError;
        if (options.isPrivate) {
            authError = await checkAuthAndParams({ schoolId });
        } else {
            authError = await publicAuthAndParams({ schoolId });
        }

        if (authError) {
            return authError as GetClassesResponse;
        }

        const classes = await executeQuery(async () => {
            return await db
                .select()
                .from(schema.classes)
                .where(eq(schema.classes.schoolId, schoolId))
                .orderBy(asc(schema.classes.activity), asc(schema.classes.name));
        });

        if (!classes || classes.length === 0) {
            return {
                success: true,
                message: messages.classes.success,
                data: [],
            };
        }

        return {
            success: true,
            message: messages.classes.success,
            data: classes,
        };
    } catch (error) {
        dbLog({ description: `Error fetching classes: ${error instanceof Error ? error.message : String(error)}`, schoolId });
        return {
            success: false,
            message: messages.common.serverError,
        };
    }
}
