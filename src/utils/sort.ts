import { ColumnType } from "@/models/types/dailySchedule";
import { TeacherRow } from "@/models/types/table";
import routePath from "@/routes";
import { ColumnDef } from "@tanstack/react-table";

/**
 * Sorts an array of objects by their Hebrew name property in alphabetical order (א-ב-ג...)
 * @param items - Array of objects with a name property containing Hebrew text
 * @param nameKey - The key of the property to sort by (defaults to 'name')
 * @returns A new sorted array
 */
export const sortByHebrewName = <T extends Record<string, any>>(
    items: T[],
    nameKey: keyof T = "name" as keyof T,
): T[] => {
    return [...items].sort((a, b) => {
        const nameA = String(a[nameKey]);
        const nameB = String(b[nameKey]);
        return nameA.localeCompare(nameB, "he", { numeric: true });
    });
};

// Sort columns by issueTeacherType in order: [existingTeacher], [missingTeacher], [event]
export const sortColumnsByIssueTeacherType = (filteredCols: ColumnDef<TeacherRow>[]) => {
    const getTypeOrder = (type: ColumnType) => {
        switch (type) {
            case "existingTeacher":
                return 1;
            case "missingTeacher":
                return 2;
            case "event":
                return 3;
            default:
                return 4;
        }
    };
    
    const sortedCols = filteredCols.sort((a, b) => {
        const aType = a.meta?.type as ColumnType;
        const bType = b.meta?.type as ColumnType;
        return getTypeOrder(aType) - getTypeOrder(bType);
    });
    return sortedCols;
}


