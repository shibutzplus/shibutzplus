import { WeeklySchedule } from "@/models/types/annualSchedule";

/**
 * Checks if the schedule contains any incomplete cells.
 * A cell is considered incomplete if it has data but not fully matched content.
 * 
 * Logic:
 * In Annual Teacher view: Valid if (Subjects > 0 AND Classes > 0) OR (Subjects == 0 AND Classes == 0).
 * In Annual Class view: Valid if (Subjects > 0 AND Teachers > 0) OR (Subjects == 0 AND Teachers == 0).
 * 
 * So in general for any cell structure that has { subjects, classes/teachers }:
 * It is incomplete if: (has subjects !== has other entity).
 * 
 * @param schedule The full weekly schedule object
 * @returns true if any incomplete cell is found
 */
export const hasIncompleteCells = (schedule: WeeklySchedule): boolean => {
    for (const mainKey in schedule) {
        const days = schedule[mainKey];
        if (!days) continue;

        for (const dayKey in days) {
            const hours = days[dayKey];
            if (!hours) continue;

            for (const hourKey in hours) {
                const cell = hours[hourKey];
                if (!cell) continue;

                // Generalized check for both Teacher (classes) and Class (teachers) views
                // Note: The cell type has `subjects` and either `classes` or `teachers`.
                const hasSubjects = (cell.subjects?.length || 0) > 0;
                const hasOthers =
                    ((cell.classes?.length || 0) > 0) ||
                    ((cell.teachers?.length || 0) > 0);

                // XOR check: if one exists but not the other, it's incomplete
                if (hasSubjects !== hasOthers) {
                    return true;
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
export const removeIncompleteCells = (schedule: WeeklySchedule): WeeklySchedule => {
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
                const hasOthers =
                    ((cell.classes?.length || 0) > 0) ||
                    ((cell.teachers?.length || 0) > 0);

                if (hasSubjects !== hasOthers) {
                    // Clear the cell
                    delete newSchedule[mainKey][dayKey][hourKey];
                }
            }
        }
    }
    return newSchedule;
};
