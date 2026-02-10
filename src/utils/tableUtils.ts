import { DailySchedule, ColumnType, ColumnTypeValues } from "@/models/types/dailySchedule";
import { TeacherScheduleType } from "@/models/types/portalSchedule";
import { AppType } from "@/models/types";
import { getCellDisplayData } from "@/utils/dailyCellDisplay";

// Minimum rows to always show
const MIN_ROWS = 6;

/**
 * Helper to generate the array of visible row numbers.
 * Ensures at least MIN_ROWS are shown, up to the maximum data row or toHour.
 */
const generateVisibleRows = (maxHourWithData: number, fromHour: number, toHour: number): number[] => {
    const minLastRow = Math.max(6, fromHour);
    const lastRow = Math.min(toHour, Math.max(minLastRow, maxHourWithData));
    const count = Math.max(0, lastRow - fromHour + 1);
    return Array.from({ length: count }, (_, i) => fromHour + i);
};

/**
 * Calculates the visible rows for Daily View tables (FullScreenScheduleTable, PreviewTable).
 * Scans all columns and rows to find the maximum row with content.
 */
export const calculateVisibleRowsForDaily = (
    schedule: DailySchedule[string] | undefined,
    sortedColumns: string[],
    columnTypes: Record<string, ColumnType>,
    appType: AppType = "private",
    fromHour: number = 1,
    toHour: number = 10
): number[] => {
    let maxHourWithData = MIN_ROWS;

    if (schedule && sortedColumns.length > 0) {
        sortedColumns.forEach((colId) => {
            const column = schedule[colId];
            if (!column) return;

            Object.entries(column).forEach(([rowStr, cell]) => {
                const row = parseInt(rowStr, 10);
                if (isNaN(row)) return;

                const typeInt = columnTypes[colId] ?? ColumnTypeValues.event;

                if (typeInt === ColumnTypeValues.event) {
                    if (cell?.event) {
                        maxHourWithData = Math.max(maxHourWithData, row);
                    }
                } else {
                    // For teacher cells
                    const { isEmpty } = getCellDisplayData(cell, typeInt, appType);
                    if (!isEmpty) {
                        maxHourWithData = Math.max(maxHourWithData, row);
                    }
                }
            });
        });
    }

    return generateVisibleRows(maxHourWithData, fromHour, toHour);
};

/**
 * Calculates the visible rows for Teacher Table.
 * Scans the day's schedule to find the maximum row with content.
 */
export const calculateVisibleRowsForTeacher = (
    dayTable: { [hour: string]: TeacherScheduleType } | undefined,
    fromHour: number = 1,
    toHour: number = 10
): number[] => {
    let maxHourWithData = MIN_ROWS;

    if (dayTable) {
        Object.entries(dayTable).forEach(([hourStr, cell]) => {
            const row = parseInt(hourStr, 10);
            if (isNaN(row)) return;

            const hasContent = !!cell.subject ||
                !!cell.event ||
                (!!cell.classes && cell.classes.length > 0) ||
                !!cell.subTeacher ||
                !!cell.instructions ||
                !!cell.secondary;

            if (hasContent) {
                maxHourWithData = Math.max(maxHourWithData, row);
            }
        });
    }

    return generateVisibleRows(maxHourWithData, fromHour, toHour);
};
