//
// Temporary page for running migrations - Will be removed after migration is done
//

import { NextResponse } from "next/server";
import { db } from "@/db";
import { dailySchedule } from "@/db/schema/daily-schedule";
import { eq, and } from "drizzle-orm";
import { sortDailyColumnIdsByPosition } from "@/utils/sort";
import { initDailyEventCellData, initDailyTeacherCellData } from "@/services/daily/initialize";
import { ColumnTypeValues, DailyScheduleCell, DailyScheduleType } from "@/models/types/dailySchedule";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { schoolId } = body;

        if (!schoolId) {
            return NextResponse.json({ error: "schoolId is required" }, { status: 400 });
        }

        // 1. Fetch all records for the school
        const allRecords = await db.query.dailySchedule.findMany({
            where: eq(dailySchedule.schoolId, schoolId),
        });

        if (allRecords.length === 0) {
            return NextResponse.json({ message: "No records found for this school", count: 0 });
        }

        // 2. Group by date
        const recordsByDate: Record<string, DailyScheduleType[]> = {};

        allRecords.forEach((record) => {
            // Ensure date is a string key
            const dateKey = typeof record.date === 'string' ? record.date : (record.date as unknown as Date).toISOString().split('T')[0];
            if (!recordsByDate[dateKey]) {
                recordsByDate[dateKey] = [];
            }
            // Cast record to DailyScheduleType as Drizzle return type matches reasonably well
            // but we need to ensure compatibility with init functions
            recordsByDate[dateKey].push(record as unknown as DailyScheduleType);
        });

        let updatedDaysCount = 0;
        let updatedRecordsCount = 0;

        // 3. Process each date
        const updates: Promise<any>[] = [];

        for (const records of Object.values(recordsByDate)) {
            const daySchedule: Record<string, Record<string, DailyScheduleCell>> = {};
            const columnIds = new Set<string>();

            // Build the DaySchedule structure
            records.forEach(record => {
                let cell: DailyScheduleCell;

                // Determine type and use appropriate init function
                if (record.issueTeacherType === ColumnTypeValues.event) {
                    cell = initDailyEventCellData(record);
                } else {
                    cell = initDailyTeacherCellData(record);
                }

                if (!daySchedule[record.columnId]) {
                    daySchedule[record.columnId] = {};
                }

                // hour is integer in DB, but often used as string key in Record
                daySchedule[record.columnId][record.hour] = cell;
                columnIds.add(record.columnId);
            });

            const uniqueColumnIds = Array.from(columnIds);

            // Sort columns
            const sortedColumnIds = sortDailyColumnIdsByPosition(uniqueColumnIds, daySchedule);

            // Assign positions and prepare updates
            sortedColumnIds.forEach((columnId, index) => {
                const newPosition = (index + 1) * 1000;

                // Push promise to update all records for this columnId AND date
                // Ideally we update by columnId, but verify columnId is unique across dates?
                // Actually columnId is UUID, so it should be unique globally (or at least unlikely to collide).
                // But let's be safe and just update where columnId matches.
                // NOTE: Creating a separate update for each column specific to this date context.

                updates.push(
                    db.update(dailySchedule)
                        .set({ position: newPosition })
                        .where(and(eq(dailySchedule.columnId, columnId), eq(dailySchedule.schoolId, schoolId)))
                );

                // Count records affected (approximate, since update is async)
                const columnsRecords = records.filter(r => r.columnId === columnId);
                updatedRecordsCount += columnsRecords.length;
            });

            updatedDaysCount++;
        }

        // Execute all updates
        await Promise.all(updates);

        return NextResponse.json({
            success: true,
            message: "Positions updated successfully",
            updatedDays: updatedDaysCount,
            updatedRecords: updatedRecordsCount,
            totalUpdatesExecuted: updates.length
        });

    } catch (error) {
        console.error("Migration error:", error);
        return NextResponse.json({ error: "Internal Server Error", details: String(error) }, { status: 500 });
    }
}
