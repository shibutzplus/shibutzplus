import { TeacherType } from "@/models/types/teachers";
import { ClassType } from "@/models/types/classes";
import { WeeklySchedule } from "@/models/types/annualSchedule";
import { sortByHebrewName } from "./sort";
import { GroupOption } from "@/models/types";

/**
 * Build teacher list for Daily schedule with priority order:
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
    hour: number,
): GroupOption[] => {
    
    //      day: {
    //          hour: {
    //              teachersId: []
    //          }
    //      }


// teachers - 1,2,3,4,5

// day d
// hour 1
// teachersId: [1,2,3,5]
// sub -> 1,2 (find 1,2 in teachers + role === "substitute")
// rag -> 3,5 (find 3,5 in teachers + role === "regular")
// not -> 4 (theachers that are not in the array)



    // we have the list of all the teachers

    // מורים מחליפים
    //// teacher.role === "substitute"
    //// get anuual for teacher by day
    //// if empty - do not show

    // מורים פנויים
    //// regular teacher + teach on that day (annual) + not teaching in this hour (annual)

    //// teacher.role === "regular"
    //// get anuual for teacher by day
    //// if empty - לא פנוי
    //// cehck if teacher teach in the same hour
    //// if teach - לא פנוי

    // מורים לא פנויים
    //// regular teacher + not teach on that day (annual) || not teaching in this hour (annual)

    // אפשרויות אחרות
    //// ללא מורה
    //// ללא החלפה
    //// חסר

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

    // Separate teachers by role and availability
    const availableSubstitutes = allTeachers.filter(
        (teacher) => teacher.role === "substitute" && availableTeacherIds.has(teacher.id),
    );

    const availableRegular = allTeachers.filter(
        (teacher) => teacher.role === "regular" && availableTeacherIds.has(teacher.id),
    );

    const unavailableTeachers = allTeachers.filter((teacher) => busyTeacherIds.has(teacher.id));

    // Sort each group alphabetically in Hebrew
    const sortedAvailableSubstitutes = sortByHebrewName(availableSubstitutes);
    const sortedAvailableRegular = sortByHebrewName(availableRegular);
    const sortedUnavailableTeachers = sortByHebrewName(unavailableTeachers);

    // Build grouped options (always three groups, even if empty)
    const groups: GroupOption[] = [
        {
            label: "מורים ממלאי מקום", // Substitute
            options: sortedAvailableSubstitutes.map((teacher) => ({
                value: teacher.id,
                label: teacher.name,
            })),
        },
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

// return same grouped list without the substitutes section
export const sortTeachersForAnnualNoSubs = (
    allTeachers: TeacherType[],
    classes: ClassType[],
    schedule: WeeklySchedule,
    selectedClassId: string,
    day: string,
    hour: number,
): GroupOption[] => {
    const groups = sortTeachersForSchedule(
        allTeachers,
        classes,
        schedule,
        selectedClassId,
        day,
        hour,
    );
    // assumes documented order: [substitutes, available, unavailable]
    return groups.slice(1).filter((g) => g.options.length > 0);
};
