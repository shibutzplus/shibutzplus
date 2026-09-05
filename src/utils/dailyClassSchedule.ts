import { DailySchedule, ColumnTypeValues } from "@/models/types/dailySchedule";
import { AppType } from "@/models/types";
import { ClassType } from "@/models/types/classes";
import { getCellDisplayData } from "@/utils/dailyCellDisplay";

export interface ClassCellChangeEntry {
    subjectName: string;
    teacherName: string;
    originalTeacherName?: string;
    isMissing: boolean;
}

export type ClassScheduleMap = Record<string, Record<number, ClassCellChangeEntry[]>>;

/**
 * Sorts class names in Hebrew numeric/alphabetical order (e.g., ט1, ט2, י1, י2)
 */
export const sortClassNames = (classNames: string[]): string[] => {
    return [...classNames].sort((a, b) => a.localeCompare(b, "he", { numeric: true }));
};

/**
 * Transforms the daily teacher-based schedule into a class-based schedule map:
 * { [className]: { [hour]: ClassCellChangeEntry[] } }
 *
 * Filters out:
 * 1. Event columns (only teaching columns are processed)
 * 2. Cells that are empty or regular unchanged lessons
 * 3. Work groups (קבוצות עבודה) where activity === true in DB or on the class object
 */
export const buildClassSchedule = (
    schedule: DailySchedule[string] | undefined,
    dbClasses: ClassType[] = [],
    appType: AppType = "private"
): ClassScheduleMap => {
    const result: ClassScheduleMap = {};
    if (!schedule) return result;

    // Fast lookup sets for activity classes / work groups
    const activityClassIds = new Set(
        (dbClasses || [])
            .filter((c) => c.activity)
            .map((c) => c.id)
    );

    const activityClassNames = new Set(
        (dbClasses || [])
            .filter((c) => c.activity)
            .map((c) => c.name?.trim())
    );

    Object.values(schedule).forEach((columnData) => {
        const colFirstObj =
            columnData["1"] ||
            Object.values(columnData).find((c) => c?.headerCol?.type !== undefined);
        const colType = colFirstObj?.headerCol?.type ?? ColumnTypeValues.event;

        // Skip event columns - class view only displays teaching/substitute changes
        if (colType === ColumnTypeValues.event) return;

        const colHeaderTeacher =
            colFirstObj?.headerCol?.headerTeacher ||
            Object.values(columnData).find((c) => c?.headerCol?.headerTeacher)?.headerCol?.headerTeacher;
        const colOriginalTeacherName = colHeaderTeacher?.name?.trim() || "";

        Object.entries(columnData).forEach(([hourStr, cell]) => {
            const hour = parseInt(hourStr, 10);
            if (isNaN(hour) || !cell) return;

            const display = getCellDisplayData(cell, colType, appType);
            if (display.isEmpty) return;

            const cellClasses = cell.classes || [];
            if (cellClasses.length === 0) return;

            const isMissing = display.isMissing && !display.subTeacherName;
            const teacherName = display.subTeacherName || (isMissing ? "אין ממלא מקום" : "");
            const originalTeacherName =
                cell.headerCol?.headerTeacher?.name?.trim() || colOriginalTeacherName;
            const subjectName =
                cell.subject?.name ||
                display.subjectText?.replace(/[()]/g, "").trim() ||
                (display.isActivity ? "פעילות" : "");

            cellClasses.forEach((cls) => {
                // Filter out work groups using DB activity flag
                if (cls.activity === true) return;
                if (cls.id && activityClassIds.has(cls.id)) return;
                if (cls.name && activityClassNames.has(cls.name.trim())) return;

                const className = cls.name?.trim();
                if (!className) return;

                if (!result[className]) result[className] = {};
                if (!result[className][hour]) result[className][hour] = [];

                // Avoid duplicate entries if multiple cells reference an identical change
                const alreadyExists = result[className][hour].some(
                    (e) =>
                        e.teacherName === teacherName &&
                        e.subjectName === subjectName &&
                        e.originalTeacherName === originalTeacherName
                );
                if (!alreadyExists) {
                    result[className][hour].push({
                        subjectName,
                        teacherName,
                        originalTeacherName,
                        isMissing,
                    });
                }
            });
        });
    });

    return result;
};

/**
 * Calculates the visible row hours (1 to 10) for class tables.
 * Always shows at least 6 rows or up to the maximum hour with data.
 */
export const calculateVisibleRowsForClasses = (
    classSchedule: ClassScheduleMap,
    sortedClassNames: string[],
    fromHour: number = 1,
    toHour: number = 10,
    schedule?: DailySchedule[string],
    eventColumns?: string[]
): number[] => {
    let maxHourWithData = 6;

    sortedClassNames.forEach((className) => {
        const classHours = classSchedule[className];
        if (!classHours) return;
        Object.keys(classHours).forEach((hStr) => {
            const h = parseInt(hStr, 10);
            if (!isNaN(h) && classHours[h]?.length > 0) {
                maxHourWithData = Math.max(maxHourWithData, h);
            }
        });
    });

    if (schedule && eventColumns && eventColumns.length > 0) {
        eventColumns.forEach((colId) => {
            const columnData = schedule[colId];
            if (!columnData) return;
            Object.entries(columnData).forEach(([hStr, cell]) => {
                const h = parseInt(hStr, 10);
                if (!isNaN(h) && cell?.event) {
                    maxHourWithData = Math.max(maxHourWithData, h);
                }
            });
        });
    }

    const minLastRow = Math.max(6, fromHour);
    const lastRow = Math.min(toHour, Math.max(minLastRow, maxHourWithData));
    const count = Math.max(0, lastRow - fromHour + 1);
    return Array.from({ length: count }, (_, i) => fromHour + i);
};
