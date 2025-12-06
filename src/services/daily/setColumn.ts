import { DailySchedule, DailyScheduleCell } from "@/models/types/dailySchedule";
import { initDailySchedule } from "./populate";
import { HOURS_IN_DAY } from "@/utils/time";

/**
 * Updates a specific column in the daily schedule with new cell data.
 *
 * This function determines whether the provided `cells` belong to a teacher column or an event column
 * based on the presence of `headerTeacher` in the first cell's header data. It then delegates
 * the update process to either `setTeacherColumn` or `setEventColumn` accordingly.
 *
 * @returns The updated `DailySchedule` object with the modified column.
 */
export const setColumn = (
    cells: DailyScheduleCell[],
    newSchedule: DailySchedule,
    columnId: string,
    date: string,
) => {
    // Check if this is an teacher column by looking at the first cell
    const isTeacherColumn = cells.length > 0 && cells[0].headerCol?.headerTeacher !== undefined;
    // (cells[0].subTeacher !== undefined || cells[0].event !== undefined);

    if (isTeacherColumn) {
        setTeacherColumn(newSchedule, date, cells, columnId);
    } else {
        setEventColumn(newSchedule, date, cells, columnId);
    }
    return newSchedule;
};

export const setTeacherColumn = (
    dailySchedule: DailySchedule,
    selectedDate: string,
    columnData: DailyScheduleCell[],
    columnId: string,
) => {
    dailySchedule = initDailySchedule(dailySchedule, selectedDate, columnId);

    // Create a map of existing data for quick lookup
    const hourDataMap = new Map<number, DailyScheduleCell>();
    columnData.forEach((row) => {
        hourDataMap.set(row.hour, row);
    });

    for (let hour = 1; hour <= HOURS_IN_DAY; hour++) {
        const existingData = hourDataMap.get(hour);

        if (existingData) {
            dailySchedule[selectedDate][columnId][`${hour}`] = {
                class: existingData.class,
                subject: existingData.subject,
                hour: existingData.hour,
                subTeacher: existingData.subTeacher,
                event: existingData.event,
                headerCol: existingData.headerCol,
                DBid: existingData.DBid,
            };
        } else {
            // Empty cell
            dailySchedule[selectedDate][columnId][`${hour}`] = {
                headerCol: columnData[0].headerCol,
                hour: hour,
            };
        }
    }

    return dailySchedule;
};

export const setEventColumn = (
    dailySchedule: DailySchedule,
    selectedDate: string,
    columnData: DailyScheduleCell[],
    columnId: string,
): DailySchedule => {
    dailySchedule = initDailySchedule(dailySchedule, selectedDate, columnId);

    // Create a map of existing data for quick lookup
    const hourDataMap = new Map<number, DailyScheduleCell>();
    columnData.forEach((row) => {
        hourDataMap.set(row.hour, row);
    });

    for (let hour = 1; hour <= HOURS_IN_DAY; hour++) {
        const existingData = hourDataMap.get(hour);
        if (existingData) {
            dailySchedule[selectedDate][columnId][`${hour}`] = {
                event: existingData.event,
                hour: existingData.hour,
                headerCol: existingData.headerCol,
                DBid: existingData.DBid,
            };
        } else {
            // Empty cell with header info only
            dailySchedule[selectedDate][columnId][`${hour}`] = {
                headerCol: columnData[0].headerCol,
                hour: hour,
            };
        }
    }

    return dailySchedule;
};
