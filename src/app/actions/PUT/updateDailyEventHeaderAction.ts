"use server";

import { checkAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { eq, and } from "drizzle-orm";
import { db, schema, executeQuery } from "../../../db";
import { ActionResponse } from "@/models/types/actions";
import { ColumnTypeValues } from "@/models/types/dailySchedule";
import { NewDailyScheduleSchema } from "@/db/schema";

export async function updateDailyEventHeaderAction(
    date: string,
    columnId: string,
    eventTitle: string,
): Promise<ActionResponse> {
    try {
        const authError = await checkAuthAndParams({ date, columnId, eventTitle });
        if (authError) {
            return authError as ActionResponse;
        }

        const updatedEntries = await executeQuery(async () => {
            return await db
                .update(schema.dailySchedule)
                .set({ eventTitle: eventTitle } as Partial<NewDailyScheduleSchema>)
                .where(
                    and(
                        eq(schema.dailySchedule.date, date),
                        eq(schema.dailySchedule.columnId, columnId),
                        eq(schema.dailySchedule.issueTeacherType, ColumnTypeValues.event),
                    ),
                )
                .returning();
        });

        if (!updatedEntries.length) {
            return {
                success: false,
                message: messages.dailySchedule.updateError,
            };
        }

        return {
            success: true,
            message: messages.dailySchedule.updateSuccess,
        };
    } catch (error) {
        console.error("Error updating daily schedule:", error);
        return {
            success: false,
            message: messages.common.serverError,
        };
    }
}
