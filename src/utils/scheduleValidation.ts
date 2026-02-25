import { WeeklySchedule } from "@/models/types/annualSchedule";

export type AnnualScheduleViewType = "teacher" | "class";

/**
 * Checks if the schedule contains any incomplete cells.
 * A cell is considered incomplete if its visible fields are imbalanced.
 * 
 * In Teacher view: we check that 'subjects' and 'classes' are either both empty or both populated.
 * In Class view: we check that 'subjects' and 'teachers' are either both empty or both populated.
 * 
 * @param schedule The full weekly schedule object
 * @param viewType "teacher" or "class" indicating the current context
 * @returns true if any incomplete cell is found
 */
export const hasIncompleteCells = (schedule: WeeklySchedule, viewType: AnnualScheduleViewType): boolean => {
    for (const mainKey in schedule) {
        const days = schedule[mainKey];
        if (!days) continue;

        for (const dayKey in days) {
            const hours = days[dayKey];
            if (!hours) continue;

            for (const hourKey in hours) {
                const cell = hours[hourKey];
                if (!cell) continue;

                const hasSubjects = (cell.subjects?.length || 0) > 0;
                const hasClasses = (cell.classes?.length || 0) > 0;
                const hasTeachers = (cell.teachers?.length || 0) > 0;

                if (viewType === "teacher") {
                    if (hasSubjects !== hasClasses) return true;
                } else if (viewType === "class") {
                    if (hasSubjects !== hasTeachers) return true;
                }
            }
        }
    }
    return false;
};

/**
 * Removes incomplete cells from the schedule.
 * Returns a new schedule object with incomplete cells cleared.
 */
export const removeIncompleteCells = (schedule: WeeklySchedule, viewType: AnnualScheduleViewType): WeeklySchedule => {
    const newSchedule = { ...schedule };

    for (const mainKey in newSchedule) {
        const days = newSchedule[mainKey];
        if (!days) continue;

        for (const dayKey in days) {
            const hours = days[dayKey];
            if (!hours) continue;

            for (const hourKey in hours) {
                const cell = hours[hourKey];
                if (!cell) continue;

                const hasSubjects = (cell.subjects?.length || 0) > 0;
                const hasClasses = (cell.classes?.length || 0) > 0;
                const hasTeachers = (cell.teachers?.length || 0) > 0;

                let isIncomplete = false;
                if (viewType === "teacher") {
                    isIncomplete = hasSubjects !== hasClasses;
                } else if (viewType === "class") {
                    isIncomplete = hasSubjects !== hasTeachers;
                }

                if (isIncomplete) {
                    // Clear the cell
                    delete newSchedule[mainKey][dayKey][hourKey];
                }
            }
        }
    }
    return newSchedule;
};
