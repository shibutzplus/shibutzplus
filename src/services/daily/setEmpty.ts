import { ColumnType, DailySchedule } from "@/models/types/dailySchedule";
import { TeacherType } from "@/models/types/teachers";

/**
 * Initializes a new column in the daily schedule for a specific date and column ID.
 * * This function ensures the schedule structure exists for the given date, resets the target column,
 * and populates it with empty cell objects for the specified hour range. It uses object spreading
 * to ensure the returned schedule is a new reference, maintaining immutability.
 * @returns A new DailySchedule object with the initialized column.
 */
export const initializeEmptyColumn = (
    dailySchedule: DailySchedule,
    selectedDate: string,
    columnId: string,
    headerCol: { type: ColumnType; position: number; headerTeacher?: TeacherType },
    fromHour: number = 1,
    toHour: number = 10,
) => {
    // Create new object references for immutability
    const newSchedule = { ...dailySchedule };
    // Ensure date object exists and is a new reference
    newSchedule[selectedDate] = { ...(newSchedule[selectedDate] || {}) };

    // Initialize/Reset the specific column
    newSchedule[selectedDate][columnId] = {};

    for (let hour = fromHour; hour <= toHour; hour++) {
        newSchedule[selectedDate][columnId][`${hour}`] = {
            headerCol,
            hour: hour,
        };
    }
    return newSchedule;
};