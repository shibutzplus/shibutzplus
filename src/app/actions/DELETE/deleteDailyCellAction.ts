"use server";

import { ActionResponse } from "@/models/types/actions";
import { checkAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { db, schema, executeQuery } from "@/db";
import { and, eq } from "drizzle-orm";
import { dbLog } from "@/services/loggerService";

export async function deleteDailyCellAction(
    schoolId: string,
    dailyRowId: string,
): Promise<ActionResponse & { deletedRowId?: string }> {
    try {
        const authError = await checkAuthAndParams({ schoolId, dailyRowId });
        if (authError) {
            return authError as ActionResponse;
        }

        const deleted = await executeQuery(async () => {
            const result = await db
                .delete(schema.dailySchedule)
                .where(
                    and(
                        eq(schema.dailySchedule.schoolId, schoolId),
                        eq(schema.dailySchedule.id, dailyRowId),
                    ),
                );
            // result.rowCount or result.count depending on your DB client
            return result.rowCount ?? 0;
        });

        if (deleted > 0) {
            return {
                success: true,
                message: messages.dailySchedule.deleteSuccess,
                deletedRowId: dailyRowId,
            };
        } else {
            return {
                success: false,
                message: messages.dailySchedule.deleteError,
            };
        }
    } catch (error) {
        dbLog({ description: `Error deleting daily schedule column: ${error instanceof Error ? error.message : String(error)}`, schoolId });
        return {
            success: false,
            message: messages.dailySchedule.deleteError,
        };
    }
}
