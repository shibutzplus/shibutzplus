import { TeacherType } from "@/models/types/teachers";
import { DAYS_OF_WEEK } from "./time";
import { ClassType } from "@/models/types/classes";
import { WeeklySchedule } from "@/models/types/annualSchedule";
import { sortByHebrewName } from "./format";

// Filter out from the list teachers that already teach on other classes
export const filterExistingTeachers = (
    classes: ClassType[],
    schedule: WeeklySchedule,
    selectedClassId: string,
    teachers: TeacherType[],
) => {
    const newFilteredTeachersMap: Record<string, Record<number, TeacherType[]>> = {};

    // Pre-calculate filtered teachers for all days and hours
    DAYS_OF_WEEK.forEach((day) => {
        newFilteredTeachersMap[day] = {};

        // Assuming hours are from 1 to 10 (adjust as needed)
        for (let hour = 1; hour <= 10; hour++) {
            // Create a Set of teacher IDs that are already scheduled for this day and hour in other classes
            const busyTeacherIds = new Set<string>();

            // Check all classes except the currently selected one
            classes.forEach((cls) => {
                if (cls.id !== selectedClassId) {
                    const teacherId = schedule[cls.id]?.[day]?.[hour]?.teacher;
                    if (teacherId) {
                        busyTeacherIds.add(teacherId);
                    }
                }
            });

            // Filter out teachers who are already scheduled
            newFilteredTeachersMap[day][hour] =
                teachers?.filter((teacher) => !busyTeacherIds.has(teacher.id)) || [];
        }
    });
    return newFilteredTeachersMap;
};

/**
 * Sorts teachers for annual schedule with priority order:
 * 1. Substitute teachers (with "מחליף" label) - available first
 * 2. Regular teachers - available only
 * 3. All other teachers - alphabetically sorted
 */
import type { GroupOption } from "@/components/ui/InputGroupSelect/InputGroupSelect";

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
        if (cls.id !== selectedClassId) {
            const teacherId = schedule[cls.id]?.[day]?.[hour]?.teacher;
            if (teacherId) {
                busyTeacherIds.add(teacherId);
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
            label: "מורים מחליפים", // Substitute
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
