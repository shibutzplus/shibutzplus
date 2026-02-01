"use server";

import { publicAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { eq, and, or } from "drizzle-orm";
import { db, schema, executeQuery } from "../../../db";
import { dbLog } from "@/services/loggerService";
import { ActionResponse } from "@/models/types/actions";
import { NewDailyScheduleSchema } from "@/db/schema";
import { dailyInstructionSchema } from "@/models/validation/daily";
import { pushSyncUpdateServer } from "@/services/sync/serverSyncService";
import { MATERIAL_CHANGED } from "@/models/constant/sync";

export async function updateDailyInstructionAction(
    date: string,
    rowId: string,
    instructions?: string,
    hour?: number,
    schoolId?: string,
    originalTeacherId?: string,
    subTeacherId?: string,
): Promise<ActionResponse> {
    try {
        const validation = dailyInstructionSchema.safeParse({ instructions });
        if (!validation.success) {
            return {
                success: false,
                message: validation.error.issues[0]?.message || "תוכן ההנחיות לא תקין",
            };
        }
        // Use the transformed (sanitized) value
        const cleanInstructions = validation.data.instructions;

        const authError = await publicAuthAndParams({ date, rowId });
        if (authError) {
            return authError as ActionResponse;
        }

        const updatedEntries = await executeQuery(async () => {
            const payload = {
                instructions: cleanInstructions || null,
            } as Partial<NewDailyScheduleSchema>;

            // Update one DB row normally, or 2 rows if it's a cross-reference swap
            // 2 rows usecase: 2 teachers in the same day and hour replaced each other (cross-reference case)
            if (hour != null && schoolId && originalTeacherId && subTeacherId) {
                return await db
                    .update(schema.dailySchedule)
                    .set(payload)
                    .where(
                        and(
                            eq(schema.dailySchedule.date, date),
                            eq(schema.dailySchedule.hour, hour),
                            eq(schema.dailySchedule.schoolId, schoolId),
                            or(
                                and(
                                    eq(schema.dailySchedule.originalTeacherId, originalTeacherId),
                                    eq(schema.dailySchedule.subTeacherId, subTeacherId),
                                ),
                                and(
                                    eq(schema.dailySchedule.originalTeacherId, subTeacherId),
                                    eq(schema.dailySchedule.subTeacherId, originalTeacherId),
                                ),
                            ),
                        ),
                    )
                    .returning();
            }
            // Fallback: legacy single-row update by id (might be removed in the future, i dont think this can be reached)
            return await db
                .update(schema.dailySchedule)
                .set(payload)
                .where(and(eq(schema.dailySchedule.date, date), eq(schema.dailySchedule.id, rowId)))
                .returning();
        });

        if (!updatedEntries.length) {
            return {
                success: false,
                message: messages.dailySchedule.updateError,
            };
        }

        void pushSyncUpdateServer(MATERIAL_CHANGED, { schoolId: updatedEntries[0].schoolId, date });

        return {
            success: true,
            message: messages.dailySchedule.updateSuccess,
        };
    } catch (error) {
        dbLog({
            description: `Error updating daily instruction: ${error instanceof Error ? error.message : String(error)}`,
            schoolId,
            metadata: { date, rowId }
        });
        return {
            success: false,
            message: messages.common.serverError,
        };
    }
}
