"use server";

import { publicAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { eq, and, or } from "drizzle-orm";
import { db, schema, executeQuery } from "../../../db";
import { revalidateTag } from "next/cache";
import { cacheTags } from "@/lib/cacheTags";
import { dbLog } from "@/services/loggerService";
import { ActionResponse } from "@/models/types/actions";
import { NewDailyScheduleSchema } from "@/db/schema";
import { dailyInstructionSchema } from "@/models/validation/daily";
import { pushSyncUpdateServer } from "@/services/sync/serverSyncService";
import { MATERIAL_CHANGED } from "@/models/constant/sync";

import { createId } from "@paralleldrive/cuid2";

export async function updateDailyInstructionAction(
    date: string,
    rowId: string,
    instructions?: string | null,
    hour?: number | null,
    schoolId?: string | null,
    originalTeacherId?: string | null,
    subTeacherId?: string | null,
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

            // 1. Try updating by rowId first (the normal case where it exists)
            let updated = await db
                .update(schema.dailySchedule)
                .set(payload)
                .where(eq(schema.dailySchedule.id, rowId))
                .returning();

            if (updated.length > 0) {
                return updated;
            }

            // 2. If it's a cross-reference swap (legacy support)
            if (hour != null && schoolId && originalTeacherId && subTeacherId) {
                updated = await db
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
                if (updated.length > 0) {
                    return updated;
                }
            }

            // 3. If no row was updated and we have schoolId, hour, originalTeacherId,
            // then it's a regular schedule lesson without a daily_schedule entry.
            // Let's create one!
            if (hour != null && schoolId && originalTeacherId) {
                // Find annual schedule to get classId, subjectId, etc.
                const [year, month, day] = date.split("-").map(Number);
                const dayOfWeek = new Date(year, month - 1, day).getDay() + 1;

                // Let's query annualSchedule to populate class and subject
                const [annual] = await db
                    .select()
                    .from(schema.annualSchedule)
                    .where(
                        and(
                            eq(schema.annualSchedule.schoolId, schoolId),
                            eq(schema.annualSchedule.teacherId, originalTeacherId),
                            eq(schema.annualSchedule.day, dayOfWeek),
                            eq(schema.annualSchedule.hour, hour),
                        )
                    )
                    .limit(1);

                // If not found in annualSchedule, check annualScheduleAlt
                let finalSubjectId = annual?.subjectId || null;
                let finalClassIds = annual?.classId ? [annual.classId] : null;

                if (!annual) {
                    const [annualAlt] = await db
                        .select()
                        .from(schema.annualScheduleAlt)
                        .where(
                            and(
                                eq(schema.annualScheduleAlt.schoolId, schoolId),
                                eq(schema.annualScheduleAlt.teacherId, originalTeacherId),
                                eq(schema.annualScheduleAlt.day, dayOfWeek),
                                eq(schema.annualScheduleAlt.hour, hour),
                            )
                        )
                        .limit(1);
                    if (annualAlt) {
                        finalSubjectId = annualAlt.subjectId || null;
                        finalClassIds = annualAlt.classId ? [annualAlt.classId] : null;
                    }
                }

                // Now insert the dailySchedule row representing this regular hour with instructions
                return await db
                    .insert(schema.dailySchedule)
                    .values({
                        id: createId(),
                        schoolId,
                        date,
                        day: dayOfWeek,
                        hour,
                        columnId: `annual-${rowId}`,
                        position: 0,
                        columnType: 1, // existingTeacher (regular)
                        originalTeacherId,
                        subTeacherId: subTeacherId || null,
                        subjectId: finalSubjectId,
                        classIds: finalClassIds,
                        instructions: cleanInstructions || null,
                    })
                    .returning();
            }

            return [];
        });

        if (!updatedEntries.length) {
            return {
                success: false,
                message: messages.dailySchedule.updateError,
            };
        }

        const entrySchoolId = updatedEntries[0].schoolId;

        // invalidate cache
        revalidateTag(cacheTags.schoolSchedule(entrySchoolId));
        revalidateTag(cacheTags.dailySchedule(entrySchoolId, date));

        // Sync update to all connected clients
        void pushSyncUpdateServer(MATERIAL_CHANGED, { schoolId: entrySchoolId, date });

        return {
            success: true,
            message: messages.dailySchedule.updateSuccess,
        };
    } catch (error) {
        dbLog({
            description: `Error updating daily instruction: ${error instanceof Error ? error.message : String(error)}`,
            schoolId: schoolId || undefined,
            metadata: { date, rowId }
        });
        return {
            success: false,
            message: messages.common.serverError,
        };
    }
}
