import { DailySchedule, DailyScheduleCell, ColumnTypeValues } from "@/models/types/dailySchedule";
import { initDailySchedule } from "./populate";
import { DEFAULT_FROM_HOUR, DEFAULT_TO_HOUR } from "@/utils/time";

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
    fromHour: number = DEFAULT_FROM_HOUR,
    toHour: number = DEFAULT_TO_HOUR,
) => {
    const isEventColumn = cells.length > 0 && cells[0].headerCol?.type === ColumnTypeValues.event;
    if (isEventColumn) {
        setEventColumn(newSchedule, date, cells, columnId, fromHour, toHour);
    } else {
        setTeacherColumn(newSchedule, date, cells, columnId, fromHour, toHour);
    }
    return newSchedule;
};

export const setTeacherColumn = (
    dailySchedule: DailySchedule,
    selectedDate: string,
    columnData: DailyScheduleCell[],
    columnId: string,
    fromHour: number = DEFAULT_FROM_HOUR,
    toHour: number = DEFAULT_TO_HOUR,
) => {
    dailySchedule = initDailySchedule(dailySchedule, selectedDate, columnId);

    // Create a map of existing data for quick lookup
    const hourDataMap = new Map<number, DailyScheduleCell>();
    columnData.forEach((row) => {
        hourDataMap.set(row.hour, row);
    });

    for (let hour = fromHour; hour <= toHour; hour++) {
        const existingData = hourDataMap.get(hour);

        if (existingData) {
            dailySchedule[selectedDate][columnId][`${hour}`] = {
                classes: existingData.classes,
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
    fromHour: number = DEFAULT_FROM_HOUR,
    toHour: number = DEFAULT_TO_HOUR,
): DailySchedule => {
    dailySchedule = initDailySchedule(dailySchedule, selectedDate, columnId);

    // Create a map of existing data for quick lookup
    const hourDataMap = new Map<number, DailyScheduleCell>();
    columnData.forEach((row) => {
        hourDataMap.set(row.hour, row);
    });

    for (let hour = fromHour; hour <= toHour; hour++) {
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

    // Include the -1 hour cell: contains the column header/event title
    const eventTitleCell = hourDataMap.get(-1);
    if (eventTitleCell) {
        dailySchedule[selectedDate][columnId]["-1"] = {
            event: eventTitleCell.event,
            hour: -1,
            headerCol: eventTitleCell.headerCol,
            DBid: eventTitleCell.DBid,
        };
    }

    return dailySchedule;
};
