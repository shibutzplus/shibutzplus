"use server";

import { ActionResponse } from "@/models/types/actions";
import { DailyScheduleType } from "@/models/types/dailySchedule";
import { checkAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { db, schema, executeQuery } from "@/db";
import { and, eq } from "drizzle-orm";

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
        console.error("Error deleting daily schedule column:", error);
        return {
            success: false,
            message: messages.dailySchedule.deleteError,
        };
    }
}
