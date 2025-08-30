import { TeacherType } from "@/models/types/teachers";
import { ClassType } from "@/models/types/classes";
import { WeeklySchedule } from "@/models/types/annualSchedule";
import { sortByHebrewName } from "./format";
import { GroupOption } from "@/models/types";

/**
 * Sorts teachers for annual schedule with priority order:
 * 1. Substitute teachers (with "מחליף" label) - available first
 * 2. Regular teachers - available only
 * 3. All other teachers - alphabetically sorted
 */
export const sortTeachersForSchedule = (
    allTeachers: TeacherType[],
    classes: ClassType[],
    schedule: WeeklySchedule,
    selectedClassId: string,
    day: string,
    hour: number
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
    const availableTeachers = allTeachers.filter(teacher => !busyTeacherIds.has(teacher.id));
    const availableTeacherIds = new Set(availableTeachers.map(t => t.id));

    // Separate teachers by role and availability
    const availableSubstitutes = allTeachers.filter(
        teacher => teacher.role === 'substitute' && availableTeacherIds.has(teacher.id)
    );

    const availableRegular = allTeachers.filter(
        teacher => teacher.role === 'regular' && availableTeacherIds.has(teacher.id)
    );

    const unavailableTeachers = allTeachers.filter(
        teacher => busyTeacherIds.has(teacher.id)
    );

    // Sort each group alphabetically in Hebrew
    const sortedAvailableSubstitutes = sortByHebrewName(availableSubstitutes);
    const sortedAvailableRegular = sortByHebrewName(availableRegular);
    const sortedUnavailableTeachers = sortByHebrewName(unavailableTeachers);

    // Build grouped options (always three groups, even if empty)
    const groups: GroupOption[] = [
        {
            label: "מורים ממלאי מקום", // Substitute
            options: sortedAvailableSubstitutes.map(teacher => ({
                value: teacher.id,
                label: teacher.name
            }))
        },
        {
            label: "מורים פנויים", // Available
            options: sortedAvailableRegular.map(teacher => ({
                value: teacher.id,
                label: teacher.name
            }))
        },
        {
            label: "מורים לא פנויים", // Unavailable
            options: sortedUnavailableTeachers.map(teacher => ({
                value: teacher.id,
                label: teacher.name
            }))
        }
    ];

    return groups;
}
