import { ColumnType, DailySchedule } from "@/models/types/dailySchedule";
import { HOURS_IN_DAY } from "@/utils/time";
import { initDailySchedule } from "./populate";
import { TeacherType } from "@/models/types/teachers";

/**
 * Creates a new empty column in the daily schedule for a specific date.
 */
export const createNewEmptyColumn = (
    dailySchedule: DailySchedule,
    selectedDate: string,
    columnId: string,
    type: ColumnType,
    hoursNum: number = HOURS_IN_DAY,
) => {
    // Initialize structure immutably
    const initializedSchedule = initDailySchedule(dailySchedule, selectedDate, columnId);

    // We'll build the new column object
    const existingDate = initializedSchedule[selectedDate];
    const existingColumn = existingDate[columnId] || {};
    const newColumn = { ...existingColumn };

    for (let hour = 1; hour <= hoursNum; hour++) {
        newColumn[`${hour}`] = {
            headerCol: { type },
            hour: hour,
        };
    }

    return {
        ...initializedSchedule,
        [selectedDate]: {
            ...existingDate,
            [columnId]: newColumn
        }
    };
};

/**
 * Initializes an empty teacher column for a specific date in the daily schedule.
 */
export const setEmptyTeacherColumn = (
    dailySchedule: DailySchedule,
    selectedDate: string,
    columnId: string,
    type: ColumnType,
    hoursNum: number = HOURS_IN_DAY,
    headerTeacher?: TeacherType,
) => {
    // Initialize structure immutably
    const initializedSchedule = initDailySchedule(dailySchedule, selectedDate, columnId);

    // We'll build the new column object
    const existingDate = initializedSchedule[selectedDate];
    const existingColumn = existingDate[columnId] || {};
    const newColumn = { ...existingColumn };

    for (let hour = 1; hour <= hoursNum; hour++) {
        newColumn[`${hour}`] = {
            headerCol: { headerTeacher, type },
            hour: hour,
        };
    }

    return {
        ...initializedSchedule,
        [selectedDate]: {
            ...existingDate,
            [columnId]: newColumn
        }
    };
};

/**
 * Initializes an empty entry for a specific date in the daily schedule if it doesn't exist.
 */
export const setEmptyColumn = (mainDailyTable: DailySchedule, selectedDate: string) => {
    if (mainDailyTable[selectedDate]) return mainDailyTable;

    return {
        ...mainDailyTable,
        [selectedDate]: {}
    };
};
