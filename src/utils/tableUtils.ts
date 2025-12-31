
import { DailySchedule, ColumnType } from "@/models/types/dailySchedule";
import { TeacherScheduleType } from "@/models/types/portalSchedule";
import { AppType } from "@/models/types";
import { getCellDisplayData } from "@/utils/dailyCellDisplay";

// Minimum rows to always show
const MIN_ROWS = 6;

/**
 * Calculates the visible rows for Daily View tables (TvScheduleTable, PreviewTable).
 * Scans all columns and rows to find the maximum row with content.
 */
export const calculateVisibleRowsForDaily = (
    schedule: DailySchedule[string] | undefined,
    sortedColumns: string[],
    columnTypes: Record<string, ColumnType>,
    appType: AppType = "private",
    hoursNum?: number
): number[] => {
    let maxRowWithData = MIN_ROWS;

    if (schedule && sortedColumns.length > 0) {
        sortedColumns.forEach(colId => {
            const columnData = schedule[colId];
            if (!columnData) return;

            Object.keys(columnData).forEach(rowKey => {
                const rowNum = parseInt(rowKey);
                const cell = columnData[rowNum];
                const type = columnTypes[colId] || "event";

                if (type === "event") {
                    if (cell?.event) {
                        if (rowNum > maxRowWithData) maxRowWithData = rowNum;
                    }
                } else {
                    // For teacher cells
                    const { isEmpty } = getCellDisplayData(cell, type, appType);
                    if (!isEmpty) {
                        if (rowNum > maxRowWithData) maxRowWithData = rowNum;
                    }
                }
            });
        });
    }

    // Determine final limit
    let limit = maxRowWithData;
    if (hoursNum) {
        limit = Math.min(maxRowWithData, hoursNum);
    }

    const safeLimit = Math.max(limit, MIN_ROWS);
    return Array.from({ length: safeLimit }, (_, i) => i + 1);
};

/**
 * Calculates the visible rows for Teacher Table.
 * Scans the day's schedule to find the maximum row with content.
 */
export const calculateVisibleRowsForTeacher = (
    dayTable: { [hour: string]: TeacherScheduleType } | undefined,
    hoursNum?: number
): number[] => {
    let maxRowWithData = MIN_ROWS;

    if (dayTable) {
        Object.keys(dayTable).forEach((key) => {
            const rowNum = parseInt(key);
            const rowData = dayTable[key];

            if (rowData) {
                const hasContent =
                    (rowData.classes && rowData.classes.length > 0) ||
                    rowData.subject ||
                    rowData.event ||
                    rowData.instructions;

                if (hasContent) {
                    if (rowNum > maxRowWithData) maxRowWithData = rowNum;
                }
            }
        });
    }

    let limit = maxRowWithData;
    if (hoursNum) {
        limit = Math.min(maxRowWithData, hoursNum);
    }

    const safeLimit = Math.max(limit, MIN_ROWS);
    return Array.from({ length: safeLimit }, (_, i) => i + 1);
};
