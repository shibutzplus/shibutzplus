"use server";

import { publicAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { eq, and } from "drizzle-orm";
import { db, schema, executeQuery } from "../../../db";
import { ActionResponse } from "@/models/types/actions";
import { NewDailyScheduleSchema } from "@/db/schema";

export async function updateDailyInstructionAction(
    date: string,
    rowId: string,
    instructions?: string,
): Promise<ActionResponse> {
    try {
        const authError = await publicAuthAndParams({ date, rowId });
        if (authError) {
            return authError as ActionResponse;
        }

        const updatedEntries = await executeQuery(async () => {
            return await db
                .update(schema.dailySchedule)
                .set({ instructions: instructions || null } as Partial<NewDailyScheduleSchema>)
                .where(
                    and(
                        eq(schema.dailySchedule.date, date),
                        eq(schema.dailySchedule.id, rowId),
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
