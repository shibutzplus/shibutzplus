"use server";

/** Updates recurring event & guard fields (title or specific hour content) from a specified date onwards. */

import { ActionResponse } from "@/models/types/actions";
import { checkAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { db, schema, executeQuery } from "@/db";
import { and, eq, gte } from "drizzle-orm";
import { NewDailyScheduleSchema } from "@/db/schema";
import { ColumnType, ColumnTypeValues } from "@/models/types/dailySchedule";
import { dbLog } from "@/services/loggerService";
import { pushSyncUpdateServer } from "@/services/sync/serverSyncService";
import { DAILY_EVENT_COL_DATA_CHANGED } from "@/models/constant/sync";
import { revalidateTag } from "next/cache";
import { cacheTags } from "@/lib/cacheTags";

export type RecurringUpdateFields = {
    eventTitle?: string;
    event?: string;
    guardTeacherIds?: string[];
    instructions?: string | null;
};

export async function updateRecurringFromDateAction(
    schoolId: string,
    columnId: string,
    fromDate: string,
    fields: RecurringUpdateFields,
    hourFilter?: number, // if provided, only update that specific hour across all future weeks
): Promise<ActionResponse> {
    try {
        const authError = await checkAuthAndParams({ schoolId, columnId, date: fromDate });
        if (authError) {
            return authError as ActionResponse;
        }

        const baseCondition = and(
            eq(schema.dailySchedule.schoolId, schoolId),
            eq(schema.dailySchedule.columnId, columnId),
            gte(schema.dailySchedule.date, fromDate),
        );

        // Fetch all rows for this column from fromDate onwards
        const allColumnRows = await executeQuery(() =>
            db
                .select()
                .from(schema.dailySchedule)
                .where(baseCondition),
        );

        if (!allColumnRows.length) {
            return { success: true, message: messages.dailySchedule.updateSuccess };
        }

        // Group rows by date
        const datesMap = new Map<string, {
            day: number;
            position: number;
            eventTitle: string | null;
            columnType: ColumnType;
            hourMap: Map<number, typeof schema.dailySchedule.$inferSelect>;
        }>();

        for (const row of allColumnRows) {
            if (!datesMap.has(row.date)) {
                datesMap.set(row.date, {
                    day: row.day,
                    position: row.position,
                    eventTitle: row.eventTitle,
                    columnType: (row.columnType as ColumnType) ?? ColumnTypeValues.event,
                    hourMap: new Map(),
                });
            }
            const dateInfo = datesMap.get(row.date)!;
            dateInfo.hourMap.set(row.hour, row);
            if (row.eventTitle) {
                dateInfo.eventTitle = row.eventTitle;
            }
            if (row.columnType) {
                dateInfo.columnType = row.columnType as ColumnType;
            }
        }

        const isClearingCell =
            (fields.event === "" || fields.event === null) &&
            (!fields.guardTeacherIds || fields.guardTeacherIds.length === 0);

        if (hourFilter !== undefined) {
            if (isClearingCell) {
                // Delete the cell across all matching future weeks in a single batch query
                await executeQuery(() =>
                    db
                        .delete(schema.dailySchedule)
                        .where(
                            and(
                                baseCondition,
                                eq(schema.dailySchedule.hour, hourFilter),
                            ),
                        ),
                );
            } else {
                const updateSet: Partial<NewDailyScheduleSchema> = {};
                if (fields.event !== undefined) updateSet.event = fields.event;
                if (fields.guardTeacherIds !== undefined) updateSet.guardTeacherIds = fields.guardTeacherIds;
                if (fields.instructions !== undefined) updateSet.instructions = fields.instructions;

                // 1. Update all existing rows for this hour in a single query
                await executeQuery(() =>
                    db
                        .update(schema.dailySchedule)
                        .set(updateSet)
                        .where(
                            and(
                                baseCondition,
                                eq(schema.dailySchedule.hour, hourFilter),
                            ),
                        ),
                );

                // 2. Collect any future dates that did not have this hour row, and insert in a single batch
                const missingRowsToInsert: NewDailyScheduleSchema[] = [];
                for (const [targetDate, dateInfo] of datesMap.entries()) {
                    if (!dateInfo.hourMap.has(hourFilter)) {
                        missingRowsToInsert.push({
                            schoolId,
                            date: targetDate,
                            day: dateInfo.day,
                            hour: hourFilter,
                            columnId,
                            position: dateInfo.position,
                            columnType: dateInfo.columnType,
                            eventTitle: dateInfo.eventTitle,
                            event: fields.event ?? "",
                            guardTeacherIds: fields.guardTeacherIds ?? null,
                            instructions: fields.instructions ?? null,
                        });
                    }
                }

                if (missingRowsToInsert.length > 0) {
                    await executeQuery(() =>
                        db.insert(schema.dailySchedule).values(missingRowsToInsert),
                    );
                }
            }
        } else {
            // General column update (e.g. eventTitle across all rows)
            await executeQuery(() =>
                db
                    .update(schema.dailySchedule)
                    .set(fields as Partial<NewDailyScheduleSchema>)
                    .where(baseCondition),
            );
        }

        // Invalidate cache and push sync for each affected date
        const affectedDates = Array.from(datesMap.keys());
        revalidateTag(cacheTags.dailyScheduleSchool(schoolId));
        revalidateTag(cacheTags.schoolSchedule(schoolId));
        for (const date of affectedDates) {
            revalidateTag(cacheTags.dailySchedule(schoolId, date));
            await pushSyncUpdateServer(DAILY_EVENT_COL_DATA_CHANGED, { schoolId, date });
        }

        return { success: true, message: messages.dailySchedule.updateSuccess };
    } catch (error) {
        dbLog({
            description: `Error updating recurring column from date: ${error instanceof Error ? error.message : String(error)}`,
            schoolId,
            metadata: { columnId, fromDate, fields, hourFilter },
        });
        return { success: false, message: messages.common.serverError };
    }
}
