import { TeacherType } from "@/models/types/teachers";
import { DAYS_OF_WEEK } from "./time";
import { ClassType } from "@/models/types/classes";
import { WeeklySchedule } from "@/models/types/annualSchedule";

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
