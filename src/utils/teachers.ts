import { TeacherType } from "@/models/types/teachers";
import { DAYS_OF_WEEK } from "./time";
import { ClassType } from "@/models/types/classes";
import { WeeklySchedule } from "@/models/types/annualSchedule";
import { SelectOption } from "@/models/types";
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
export const sortTeachersForSchedule = (
    allTeachers: TeacherType[],
    classes: ClassType[],
    schedule: WeeklySchedule,
    selectedClassId: string,
    day: string,
    hour: number
): SelectOption[] => {
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
    
    const otherTeachers = allTeachers.filter(
        teacher => !availableTeacherIds.has(teacher.id)
    );
    
    // Sort each group alphabetically in Hebrew
    const sortedAvailableSubstitutes = sortByHebrewName(availableSubstitutes);
    const sortedAvailableRegular = sortByHebrewName(availableRegular);
    const sortedOtherTeachers = sortByHebrewName(otherTeachers);
    
    // Convert to SelectOption format
    const result: SelectOption[] = [];
    
    // Add available substitutes with label
    sortedAvailableSubstitutes.forEach(teacher => {
        result.push({
            value: teacher.id,
            label: `${teacher.name} (מחליף פנוי)`
        });
    });
    
    // Add available regular teachers
    sortedAvailableRegular.forEach(teacher => {
        result.push({
            value: teacher.id,
            label: `${teacher.name} (פנוי)`
        });
    });
    
    // Add other teachers (unavailable)
    sortedOtherTeachers.forEach(teacher => {
        const label = teacher.role === 'substitute' 
            ? `${teacher.name} (מחליף)` 
            : teacher.name;
        result.push({
            value: teacher.id,
            label: label
        });
    });
    
    return result;
};
