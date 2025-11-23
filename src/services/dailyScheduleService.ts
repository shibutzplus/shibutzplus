import { HOURS_IN_DAY } from "@/utils/time";
import { ColumnType, DailySchedule, DailyScheduleCell } from "@/models/types/dailySchedule";
import { TeacherType } from "@/models/types/teachers";
import { initDailySchedule } from "./daily/populate";

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

export const createNewEmptyColumn = (
    dailySchedule: DailySchedule,
    selectedDate: string,
    columnId: string,
    type: ColumnType,
) => {
    dailySchedule = initDailySchedule(dailySchedule, selectedDate, columnId);

    for (let hour = 1; hour <= HOURS_IN_DAY; hour++) {
        dailySchedule[selectedDate][columnId][`${hour}`] = {
            headerCol: { type },
            hour: hour,
        };
    }
    return dailySchedule;
};

export const setEmptyTeacherColumn = (
    dailySchedule: DailySchedule,
    selectedDate: string,
    columnId: string,
    type: ColumnType,
    headerTeacher?: TeacherType,
) => {
    dailySchedule = initDailySchedule(dailySchedule, selectedDate, columnId);

    for (let hour = 1; hour <= HOURS_IN_DAY; hour++) {
        dailySchedule[selectedDate][columnId][`${hour}`] = {
            headerCol: { headerTeacher, type },
            hour: hour,
        };
    }
    return dailySchedule;
};

export const setEmptyColumn = (mainDailyTable: DailySchedule, selectedDate: string) => {
    const updateDailyTable = { ...mainDailyTable };
    if (!updateDailyTable[selectedDate]) {
        updateDailyTable[selectedDate] = {};
    }
    return updateDailyTable;
};

//NOT IN USE
export const getColumnsFromStorage = (storageData: {
    [header: string]: {
        [hour: string]: DailyScheduleCell;
    };
}) => {
    const columnsToCreate: { id: string; type: ColumnType }[] = [];
    const seenColumnIds = new Set<string>();

    // Extract column information from storage
    Object.entries(storageData).forEach(([columnId, hourData]) => {
        if (!seenColumnIds.has(columnId)) {
            seenColumnIds.add(columnId);
            const firstHour = Object.values(hourData)[0] as DailyScheduleCell;
            if (firstHour?.headerCol) {
                columnsToCreate.push({
                    id: columnId,
                    type: firstHour.headerCol.type,
                });
            }
        }
    });
    return columnsToCreate;
};
