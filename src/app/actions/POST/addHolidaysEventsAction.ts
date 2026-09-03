"use server";

/** Automatically adds Israeli school holiday events to the school daily schedule for the current school year. */

import { ActionResponse } from "@/models/types/actions";
import { ColumnTypeValues } from "@/models/types/dailySchedule";
import { checkAuthAndParams } from "@/utils/authUtils";
import messages from "@/resources/messages";
import { db, schema, executeQuery } from "@/db";
import { and, eq, gte, lte } from "drizzle-orm";
import { NewDailyScheduleSchema } from "@/db/schema";
import { dbLog } from "@/services/loggerService";
import { pushSyncUpdateServer } from "@/services/sync/serverSyncService";
import { DAILY_EVENT_COL_DATA_CHANGED } from "@/models/constant/sync";
import { revalidateTag } from "next/cache";
import { cacheTags } from "@/lib/cacheTags";
import { createId } from "@paralleldrive/cuid2";
import { getAllSchoolHolidaysForYear, getSchoolYearRange } from "@/utils/schoolHolidays";

export async function addHolidaysEventsAction(
    schoolId: string,
): Promise<ActionResponse & { count?: number }> {
    try {
        const authError = await checkAuthAndParams({ schoolId });
        if (authError) {
            return authError as ActionResponse;
        }

        // Get the school year range (1 Sept – 30 June)
        const { startDate, endDate } = getSchoolYearRange(new Date());

        // Get all school holiday days (Sun–Fri) in this school year
        const allHolidays = getAllSchoolHolidaysForYear(new Date());

        if (!allHolidays.length) {
            return { success: true, count: 0, message: "לא נמצאו ימי חופשה להוספה" };
        }

        // Fetch existing daily schedule entries for this school across the school year
        // to detect holidays already added (avoid duplicates)
        const existingRows = await executeQuery(() =>
            db
                .select({
                    date: schema.dailySchedule.date,
                    columnId: schema.dailySchedule.columnId,
                    eventTitle: schema.dailySchedule.eventTitle,
                })
                .from(schema.dailySchedule)
                .where(
                    and(
                        eq(schema.dailySchedule.schoolId, schoolId),
                        gte(schema.dailySchedule.date, startDate),
                        lte(schema.dailySchedule.date, endDate),
                    ),
                ),
        );

        // Map existing rows by date for fast O(1) lookups
        const holidayRowByDate = new Map<string, typeof existingRows[0]>();
        const titlesByDate = new Map<string, string[]>();

        for (const row of existingRows) {
            if (row.columnId?.startsWith("holiday_")) {
                holidayRowByDate.set(row.date, row);
            }
            if (row.eventTitle) {
                const list = titlesByDate.get(row.date) || [];
                list.push(row.eventTitle);
                titlesByDate.set(row.date, list);
            }
        }

        // Prepare rows to insert (only for dates that don't already have a holiday column)
        const rowsToInsert: NewDailyScheduleSchema[] = [];
        const addedDates: string[] = [];
        const updatedDates: string[] = [];

        for (const hol of allHolidays) {
            const existingHolidayRow = holidayRowByDate.get(hol.date);

            if (existingHolidayRow) {
                // If exists and title changed (e.g. adding emoji), update it!
                if (existingHolidayRow.eventTitle !== hol.holidayName && existingHolidayRow.columnId) {
                    await executeQuery(() =>
                        db
                            .update(schema.dailySchedule)
                            .set({ eventTitle: hol.holidayName })
                            .where(
                                and(
                                    eq(schema.dailySchedule.schoolId, schoolId),
                                    eq(schema.dailySchedule.date, hol.date),
                                    eq(schema.dailySchedule.columnId, existingHolidayRow.columnId!),
                                ),
                            ),
                    );
                    updatedDates.push(hol.date);
                }
                continue;
            }

            // Check if there's already an event on this date with the same base holiday name
            const dateTitles = titlesByDate.get(hol.date) || [];
            const hasSameTitle = dateTitles.some(
                (title) => title === hol.holidayName || hol.holidayName.startsWith(title),
            );
            if (hasSameTitle) {
                continue;
            }

            const columnId = `holiday_${createId()}`;

            rowsToInsert.push({
                schoolId,
                date: hol.date,
                day: hol.dayNumber,
                hour: 1,
                columnId,
                position: 1, // First column on the right
                columnType: ColumnTypeValues.event,
                originalTeacherId: null,
                classIds: null,
                subjectId: null,
                subTeacherId: null,
                eventTitle: hol.holidayName,
                event: null,
                instructions: null,
                comment: null,
                reason: null,
            });

            addedDates.push(hol.date);
        }

        if (rowsToInsert.length > 0) {
            // Batch insert all new holiday columns
            await executeQuery(() =>
                db.insert(schema.dailySchedule).values(rowsToInsert),
            );
        }

        const totalAffected = rowsToInsert.length + updatedDates.length;
        if (totalAffected === 0) {
            return {
                success: true,
                count: 0,
                message: "כל ימי החופשה כבר מעודכנים במערכת עבור שנת לימודים זו",
            };
        }

        // Invalidate school schedule cache and each affected day's cache
        revalidateTag(cacheTags.schoolSchedule(schoolId));
        const allAffectedDates = [...addedDates, ...updatedDates];
        for (const date of allAffectedDates) {
            revalidateTag(cacheTags.dailySchedule(schoolId, date));
            void pushSyncUpdateServer(DAILY_EVENT_COL_DATA_CHANGED, { schoolId, date });
        }

        const msg = rowsToInsert.length > 0
            ? `נוספו בהצלחה ${rowsToInsert.length} ימי חופשה ללוח השנתי`
            : `עודכנו בהצלחה ${updatedDates.length} ימי חופשה ללוח השנתי`;

        return {
            success: true,
            count: totalAffected,
            message: msg,
        };
    } catch (error) {
        dbLog({
            description: `Error adding holiday events: ${error instanceof Error ? error.message : String(error)}`,
            schoolId,
        });
        return { success: false, message: messages.common.serverError };
    }
}
