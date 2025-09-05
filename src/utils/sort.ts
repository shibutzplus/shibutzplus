import { GroupOption } from "@/models/types";
import { AvailableTeachers } from "@/models/types/annualSchedule";
import { ColumnType } from "@/models/types/dailySchedule";
import { TeacherRow } from "@/models/types/table";
import { TeacherType } from "@/models/types/teachers";
import routePath from "@/routes";
import { ColumnDef } from "@tanstack/react-table";
import { dayToNumber } from "./time";

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
            case "missingTeacher":
                return 1;
            case "existingTeacher":
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
};

export const sortDailyTeachers = (
    allTeachers: TeacherType[],
    mapAvailableTeachers: AvailableTeachers,
    day: string,
    hour: number,
) => {
    const dayStr = dayToNumber(day);
    const hourStr = hour.toString();
    // Get teachers scheduled for this day/hour from annual schedule
    const scheduledTeacherIds = mapAvailableTeachers[dayStr]?.[hourStr] || [];

    // מורים מחליפים - substitute teachers who teach on this day
    const substituteTeachers = allTeachers.filter((teacher) => {
        return teacher.role === "substitute";
    });

    // מורים פנויים - regular teachers who teach on this day but NOT in this hour
    const availableTeachers = allTeachers.filter((teacher) => {
        if (teacher.role !== "regular") return false;

        // Check if teacher teaches on this day (any hour)
        const teachesOnDay =
            mapAvailableTeachers[dayStr] &&
            Object.values(mapAvailableTeachers[dayStr]).some((hourTeachers) =>
                hourTeachers.includes(teacher.id),
            );

        // Teacher is available if they teach on this day but NOT in this specific hour
        return teachesOnDay && !scheduledTeacherIds.includes(teacher.id);
    });

    // מורים לא פנויים - regular teachers who don't teach on this day OR teach in this hour
    const unavailableTeachers = allTeachers.filter((teacher) => {
        if (teacher.role !== "regular") return false;

        // Check if teacher teaches on this day
        const teachesOnDay =
            mapAvailableTeachers[dayStr] &&
            Object.values(mapAvailableTeachers[dayStr]).some((hourTeachers) =>
                hourTeachers.includes(teacher.id),
            );

        // Teacher is unavailable if they don't teach on this day OR they teach in this hour
        return !teachesOnDay || scheduledTeacherIds.includes(teacher.id);
    });

    const groups: GroupOption[] = [
        {
            label: "מורים ממלאי מקום", // Substitute
            options: substituteTeachers.map((teacher) => ({
                value: teacher.id,
                label: teacher.name,
            })),
        },
        {
            label: "מורים פנויים", // Available
            options: availableTeachers.map((teacher) => ({
                value: teacher.id,
                label: teacher.name,
            })),
        },
        {
            label: "אפשרויות אחרות",
            options: [
                { value: "noTeacher", label: "ללא מורה" },
                { value: "noSubstitute", label: "ללא החלפה" },
            ],
        },
        {
            label: "מורים לא פנויים", // Unavailable
            options: unavailableTeachers.map((teacher) => ({
                value: teacher.id,
                label: teacher.name,
            })),
        },
    ];
    return groups;
};
