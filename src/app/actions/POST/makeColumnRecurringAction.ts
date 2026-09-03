"use server";

/** Converts a daily event column into a recurring weekly event until the end of the school year. */

import { ActionResponse } from "@/models/types/actions";
import { ColumnTypeValues } from "@/models/types/dailySchedule";
import { checkAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { db, schema, executeQuery } from "@/db";
import { and, eq, inArray, max } from "drizzle-orm";
import { NewDailyScheduleSchema } from "@/db/schema";
import { dbLog } from "@/services/loggerService";
import { pushSyncUpdateServer } from "@/services/sync/serverSyncService";
import { DAILY_EVENT_COL_DATA_CHANGED } from "@/models/constant/sync";
import { revalidateTag } from "next/cache";
import { cacheTags } from "@/lib/cacheTags";
import { createId } from "@paralleldrive/cuid2";
import { getDayNumberByDateString } from "@/utils/time";
import { getWeeklyEventDates, isDateString, dateStringToTitle } from "@/utils/schoolHolidays";

const POSITION_GAP = 1000;

export async function makeColumnRecurringAction(
    schoolId: string,
    selectedDate: string,
    columnId: string,
): Promise<ActionResponse & { recColumnId?: string }> {
    try {
        const authError = await checkAuthAndParams({ schoolId, date: selectedDate, columnId });
        if (authError) {
            return authError as ActionResponse;
        }

        // Generate the new recurring columnId
        const recColumnId = `rec_${createId()}`;

        // Fetch all rows of the current column on this date
        const sourceRows = await executeQuery(() =>
            db
                .select()
                .from(schema.dailySchedule)
                .where(
                    and(
                        eq(schema.dailySchedule.schoolId, schoolId),
                        eq(schema.dailySchedule.date, selectedDate),
                        eq(schema.dailySchedule.columnId, columnId),
                    ),
                ),
        );

        if (!sourceRows.length) {
            return { success: false, message: messages.dailySchedule.updateError };
        }

        // Step 1: rename the current column to recColumnId
        await executeQuery(() =>
            db
                .update(schema.dailySchedule)
                .set({ columnId: recColumnId } as Partial<NewDailyScheduleSchema>)
                .where(
                    and(
                        eq(schema.dailySchedule.schoolId, schoolId),
                        eq(schema.dailySchedule.date, selectedDate),
                        eq(schema.dailySchedule.columnId, columnId),
                    ),
                ),
        );

        // Step 2: compute all future weekly dates (skip holidays)
        const futureDates = getWeeklyEventDates(selectedDate);

        if (futureDates.length > 0) {
            // Fetch max position for all future dates in a single query
            const maxPosRows = await executeQuery(() =>
                db
                    .select({
                        date: schema.dailySchedule.date,
                        maxPos: max(schema.dailySchedule.position),
                    })
                    .from(schema.dailySchedule)
                    .where(
                        and(
                            eq(schema.dailySchedule.schoolId, schoolId),
                            inArray(schema.dailySchedule.date, futureDates),
                        ),
                    )
                    .groupBy(schema.dailySchedule.date),
            );
            const maxPosMap = new Map(maxPosRows.map((r) => [r.date, r.maxPos ?? 0]));

            // Build all rows to insert across all future dates
            const allRowsToInsert: NewDailyScheduleSchema[] = [];
            for (const targetDate of futureDates) {
                const nextPosition = (maxPosMap.get(targetDate) ?? 0) + POSITION_GAP;
                const dayNumber = getDayNumberByDateString(targetDate);

                for (const row of sourceRows) {
                    const adaptedEventTitle =
                        row.eventTitle && isDateString(row.eventTitle)
                            ? dateStringToTitle(targetDate)
                            : row.eventTitle ?? null;

                    allRowsToInsert.push({
                        schoolId,
                        date: targetDate,
                        day: dayNumber,
                        hour: row.hour,
                        columnId: recColumnId,
                        position: nextPosition,
                        columnType: ColumnTypeValues.event,
                        originalTeacherId: null,
                        classIds: null,
                        subjectId: null,
                        subTeacherId: null,
                        eventTitle: adaptedEventTitle,
                        event: row.event ?? null,
                        instructions: row.instructions ?? null,
                        comment: row.comment ?? null,
                        reason: null,
                    });
                }
            }

            // Insert all rows in a single batch query
            if (allRowsToInsert.length > 0) {
                await executeQuery(() =>
                    db.insert(schema.dailySchedule).values(allRowsToInsert),
                );
            }

            // Invalidate cache and notify clients
            for (const targetDate of futureDates) {
                revalidateTag(cacheTags.dailySchedule(schoolId, targetDate));
                void pushSyncUpdateServer(DAILY_EVENT_COL_DATA_CHANGED, { schoolId, date: targetDate });
            }
        }

        // Invalidate cache for the original date too
        revalidateTag(cacheTags.dailyScheduleSchool(schoolId));
        revalidateTag(cacheTags.schoolSchedule(schoolId));
        revalidateTag(cacheTags.dailySchedule(schoolId, selectedDate));
        void pushSyncUpdateServer(DAILY_EVENT_COL_DATA_CHANGED, { schoolId, date: selectedDate });

        return {
            success: true,
            message: messages.dailySchedule.updateSuccess,
            recColumnId,
        };
    } catch (error) {
        dbLog({
            description: `Error making column recurring: ${error instanceof Error ? error.message : String(error)}`,
            schoolId,
            metadata: { columnId, selectedDate },
        });
        return { success: false, message: messages.common.serverError };
    }
}
