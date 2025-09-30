import { GroupOption } from "@/models/types";
import { AvailableTeachers, WeeklySchedule } from "@/models/types/annualSchedule";
import { ColumnType, DailySchedule, DailyScheduleCell } from "@/models/types/dailySchedule";
import { TeacherRow } from "@/models/types/table";
import { TeacherRoleValues, TeacherType } from "@/models/types/teachers";
import { ColumnDef } from "@tanstack/react-table";
import { dayToNumber } from "./time";
import { ClassType } from "@/models/types/classes";
import { createSelectOptions } from "./format";
import { dailySelectActivity } from "@/resources/dailySelectActivities";
import { EmptyValue } from "@/models/constant/daily";

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

// DailySchedule Dropdown: Build grouped teacher options (substitutes, available, unavailable) for a specific day/hour
export const sortDailyTeachers = (
    allTeachers: TeacherType[],
    mapAvailableTeachers: AvailableTeachers,
    dailyDay: {
        [header: string]: {
            [hour: string]: DailyScheduleCell;
        };
    },
    day: string,
    hour: number,
) => {
    const dayStr = dayToNumber(day);
    const hourStr = hour.toString();

    // Get teachers scheduled for this day/hour from annual schedule
    const scheduledTeacherIds = new Set(mapAvailableTeachers[dayStr]?.[hourStr] || []);
    const teachesOnDayIds = new Set<string>();

    // Build set of teachers who teach on this day (any hour)
    if (mapAvailableTeachers[dayStr]) {
        Object.values(mapAvailableTeachers[dayStr]).forEach((hourTeachers) => {
            hourTeachers.forEach((id) => teachesOnDayIds.add(id));
        });
    }

    // Set of teachers already assigned in other columns for this hour in daily schedule
    const dailyAssignedTeacherIds = new Set<string>();
    if (dailyDay) {
        Object.values(dailyDay).forEach((dailyColumn) => {
            const column = dailyColumn[hourStr];
            if (column) {
                // Check substitute teacher
                if (column.subTeacher?.id) {
                    dailyAssignedTeacherIds.add(column.subTeacher.id);
                }
                // // Check header teacher (main teacher for the column)
                // if (column.headerCol?.headerTeacher?.id) {
                //     dailyAssignedTeacherIds.add(column.headerCol.headerTeacher.id);
                // }
            }
        });
    }

    const substituteTeachers: TeacherType[] = [];
    const availableTeachers: TeacherType[] = [];
    const unavailableTeachers: TeacherType[] = [];

    for (const teacher of allTeachers) {
        // Skip teachers already assigned in other columns for this hour
        if (dailyAssignedTeacherIds.has(teacher.id)) {
            unavailableTeachers.push(teacher);
            continue;
        }

        if (teacher.role === TeacherRoleValues.SUBSTITUTE) {
            substituteTeachers.push(teacher);
        } else if (teacher.role === TeacherRoleValues.REGULAR) {
            const teachesToday = teachesOnDayIds.has(teacher.id);
            const scheduledThisHour = scheduledTeacherIds.has(teacher.id);

            if (teachesToday) {
                if (!scheduledThisHour) {
                    availableTeachers.push(teacher);
                } else {
                    unavailableTeachers.push(teacher);
                }
            }
        }
    }

    // Build a Set of all teacher IDs that appear anywhere in the annual (yearly) schedule
    const annualTeacherIds = new Set<string>();
    Object.values(mapAvailableTeachers || {}).forEach((hoursMap) => {
        Object.values(hoursMap || {}).forEach((ids) => {
            ids.forEach((id) => annualTeacherIds.add(id));
        });
    });

    // Regular teachers who have zero hours in the annual schedule
    const extraRegularTeachers = allTeachers.filter(
        (t) => t.role === TeacherRoleValues.REGULAR && !annualTeacherIds.has(t.id)
    );

    // TODO: if array is empty, the lable wont show (react-select functionality)
    const groups: GroupOption[] = [
        {
            label: "הסרת ממלא מקום",
            options: [{ value: EmptyValue, label: "🗑️" }],
        },
        {
            label: "מורים ממלאי מקום", // Substitute
            options: substituteTeachers.map((teacher) => ({
                value: teacher.id,
                label: teacher.name,
            })),
        },
        {
            label: "מורים פנויים", // Available Teachers
            options: availableTeachers.map((teacher) => ({
                value: teacher.id,
                label: teacher.name,
            })),
        },
        {
            label: "מורים לא פנויים", // Unavailable Teachers
            options: unavailableTeachers.map((teacher) => ({
                value: teacher.id,
                label: teacher.name,
            })),
        },
        {
            label: "מורים נוספים בתקן", // Teachers without fixed hours in the schedule
            options: extraRegularTeachers.map((t) => ({ value: t.id, label: t.name })),
        },
        {
            label: "אפשרויות נוספות",   // Additional Options like Trip, Go home, etc.
            options: dailySelectActivity,
        },
    ];
    return groups;
};


// Annual Schedule: Build grouped teacher options (available vs unavailable) for a class at a specific day/hour in the annual schedule
export const sortAnnualTeachers = (
    allTeachers: TeacherType[],
    classes: ClassType[],
    schedule: WeeklySchedule,
    selectedClassId: string,
    day: string,
    hour: number,
): GroupOption[] => {
    // Calculate available teachers for this specific day and hour
    const busyTeacherIds = new Set<string>();

    // Check all classes except the currently selected one
    classes.forEach((cls) => {
        if (cls.id != selectedClassId) {
            const teacherIds = schedule[cls.id]?.[day]?.[hour]?.teachers;
            if (teacherIds) {
                teacherIds.forEach((id) => {
                    busyTeacherIds.add(id);
                });
            }
        }
    });

    // Filter available teachers (not busy at this time)
    const availableTeachers = allTeachers.filter((teacher) => !busyTeacherIds.has(teacher.id));
    const availableTeacherIds = new Set(availableTeachers.map((t) => t.id));

    const availableRegular = allTeachers.filter(
        (teacher) =>
            teacher.role === TeacherRoleValues.REGULAR && availableTeacherIds.has(teacher.id),
    );

    const unavailableTeachers = allTeachers.filter((teacher) => busyTeacherIds.has(teacher.id));

    // Sort each group alphabetically in Hebrew
    const sortedAvailableRegular = sortByHebrewName(availableRegular);
    const sortedUnavailableTeachers = sortByHebrewName(unavailableTeachers);

    // Build grouped options (always three groups, even if empty)
    const groups: GroupOption[] = [
        {
            label: "מורים פנויים", // Available
            options: sortedAvailableRegular.map((teacher) => ({
                value: teacher.id,
                label: teacher.name,
            })),
        },
        {
            label: "מורים לא פנויים", // Unavailable
            options: sortedUnavailableTeachers.map((teacher) => ({
                value: teacher.id,
                label: teacher.name,
            })),
        },
    ];

    return groups;
};

// DailySchedule Header Dropdown: Filter header teacher options: only regular teachers, avoid duplicates
export const filterDailyHeaderTeachers = (
    teachers: TeacherType[] | undefined,
    alreadySelectedTeachers: DailySchedule,
    selectedTeacher?: TeacherType,
) => {
    const flatTeachersSet = new Set<string>();
    if (teachers) {
        Object.values(alreadySelectedTeachers).forEach((day) => {
            Object.values(day).forEach((hour) => {
                Object.values(hour).forEach((teacher) => {
                    if (teacher.headerCol?.headerTeacher?.id) {
                        flatTeachersSet.add(teacher.headerCol.headerTeacher.id);
                    }
                });
            });
        });
        const filteredTeachers = teachers.filter(
            (teacher) =>
                teacher.role === TeacherRoleValues.REGULAR &&
                (teacher.id === selectedTeacher?.id || !flatTeachersSet.has(teacher.id)),
        );
        return createSelectOptions(filteredTeachers);
    }
    return [];
};

