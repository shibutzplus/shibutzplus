import { ColumnType, DailySchedule } from "@/models/types/dailySchedule";
import { HOURS_IN_DAY } from "@/utils/time";
import { initDailySchedule } from "./populate";
import { TeacherType } from "@/models/types/teachers";

/**
 * Creates a new empty column in the daily schedule for a specific date.
 *
 * This function initializes the schedule structure for the given `selectedDate` and `columnId`.
 * It then populates the column with empty cells for all hours of the day (1 to HOURS_IN_DAY),
 * assigning the provided `type` to each cell's header information.
 * @returns The updated daily schedule with the newly created empty column.
 */
export const createNewEmptyColumn = (
    dailySchedule: DailySchedule,
    selectedDate: string,
    columnId: string,
    type: ColumnType,
    hoursNum: number = HOURS_IN_DAY,
) => {
    dailySchedule = initDailySchedule(dailySchedule, selectedDate, columnId);

    for (let hour = 1; hour <= hoursNum; hour++) {
        dailySchedule[selectedDate][columnId][`${hour}`] = {
            headerCol: { type },
            hour: hour,
        };
    }
    return dailySchedule;
};

/**
 * Initializes an empty teacher column for a specific date in the daily schedule.
 *
 * This function prepares a column for a teacher by initializing the schedule structure
 * for the given `selectedDate` and `columnId`. It then populates the column with empty
 * cells for all hours of the day (1 to HOURS_IN_DAY), assigning the provided `headerTeacher`
 * and `type` to each cell's header information.
 * @returns The updated daily schedule with the newly created empty teacher column.
 */
export const setEmptyTeacherColumn = (
    dailySchedule: DailySchedule,
    selectedDate: string,
    columnId: string,
    type: ColumnType,
    hoursNum: number = HOURS_IN_DAY,
    headerTeacher?: TeacherType,
) => {
    dailySchedule = initDailySchedule(dailySchedule, selectedDate, columnId);

    for (let hour = 1; hour <= hoursNum; hour++) {
        dailySchedule[selectedDate][columnId][`${hour}`] = {
            headerCol: { headerTeacher, type },
            hour: hour,
        };
    }
    return dailySchedule;
};

/**
 * Initializes an empty entry for a specific date in the daily schedule if it doesn't exist.
 *
 * This function creates a shallow copy of the provided `mainDailyTable` and checks if the
 * `selectedDate` key exists. If it does not, it initializes it with an empty object.
 * This ensures that the schedule structure is ready for further operations on that date.
 * @returns The updated daily schedule with the initialized date entry.
 */
export const setEmptyColumn = (mainDailyTable: DailySchedule, selectedDate: string) => {
    const updateDailyTable = { ...mainDailyTable };
    if (!updateDailyTable[selectedDate]) {
        updateDailyTable[selectedDate] = {};
    }
    return updateDailyTable;
};
