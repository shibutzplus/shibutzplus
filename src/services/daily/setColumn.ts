import { DailySchedule, DailyScheduleCell } from "@/models/types/dailySchedule";
import { ClassType } from "@/models/types/classes";
import { SubjectType } from "@/models/types/subjects";
import { initDailySchedule } from "./populate";
import { HOURS_IN_DAY } from "@/utils/time";

/**
 * Updates a specific column in the daily schedule with new cell data.
 */
export const setColumn = (
    cells: DailyScheduleCell[],
    newSchedule: DailySchedule,
    columnId: string,
    date: string,
    hoursNum: number = HOURS_IN_DAY,
) => {
    // Check if this is an teacher column by looking at the first cell
    const isTeacherColumn = cells.length > 0 && cells[0].headerCol?.headerTeacher !== undefined;

    if (isTeacherColumn) {
        return setTeacherColumn(newSchedule, date, cells, columnId, hoursNum);
    } else {
        return setEventColumn(newSchedule, date, cells, columnId, hoursNum);
    }
};

export const setTeacherColumn = (
    dailySchedule: DailySchedule,
    selectedDate: string,
    columnData: DailyScheduleCell[],
    columnId: string,
    hoursNum: number = HOURS_IN_DAY,
) => {
    // 1. Initialize structure immutably
    const initializedSchedule = initDailySchedule(dailySchedule, selectedDate, columnId);

    // We'll build the new column object
    const existingDate = initializedSchedule[selectedDate];
    const existingColumn = existingDate[columnId] || {};
    const newColumn = { ...existingColumn };

    // Create a map of existing data for quick lookup
    const hourDataMap = new Map<number, DailyScheduleCell[]>();
    columnData.forEach((row) => {
        const existingInfo = hourDataMap.get(row.hour) || [];
        existingInfo.push(row);
        hourDataMap.set(row.hour, existingInfo);
    });

    for (let hour = 1; hour <= hoursNum; hour++) {
        const existingDataList = hourDataMap.get(hour);

        if (existingDataList && existingDataList.length > 0) {
            const firstItem = existingDataList[0];

            // Map all items to scheduleItems
            const uniqueClasses = new Set();
            const scheduleItems: { class: ClassType; subject: SubjectType; DBid?: string | undefined; }[] = [];

            existingDataList.forEach((item) => {
                if (item.class && item.subject) {
                    if (!uniqueClasses.has(item.class.id)) {
                        uniqueClasses.add(item.class.id);
                        scheduleItems.push({
                            class: item.class,
                            subject: item.subject,
                            DBid: item.DBid,
                        });
                    }
                }
            });

            newColumn[`${hour}`] = {
                class: firstItem.class,
                subject: firstItem.subject,
                hour: firstItem.hour,
                subTeacher: firstItem.subTeacher, // Assuming subTeacher is consistent or we take the first one
                event: firstItem.event,
                headerCol: firstItem.headerCol,
                DBid: firstItem.DBid,
                scheduleItems: scheduleItems.length > 0 ? scheduleItems : undefined,
            };
        } else {
            // Empty cell
            newColumn[`${hour}`] = {
                headerCol: columnData[0].headerCol,
                hour: hour,
            };
        }
    }

    return {
        ...initializedSchedule,
        [selectedDate]: {
            ...existingDate,
            [columnId]: newColumn
        }
    };
};

export const setEventColumn = (
    dailySchedule: DailySchedule,
    selectedDate: string,
    columnData: DailyScheduleCell[],
    columnId: string,
    hoursNum: number = HOURS_IN_DAY,
): DailySchedule => {
    // 1. Initialize structure immutably
    const initializedSchedule = initDailySchedule(dailySchedule, selectedDate, columnId);

    // We'll build the new column object
    const existingDate = initializedSchedule[selectedDate];
    const existingColumn = existingDate[columnId] || {};
    const newColumn = { ...existingColumn };

    // Create a map of existing data for quick lookup
    const hourDataMap = new Map<number, DailyScheduleCell>();
    columnData.forEach((row) => {
        hourDataMap.set(row.hour, row);
    });

    for (let hour = 1; hour <= hoursNum; hour++) {
        const existingData = hourDataMap.get(hour);
        if (existingData) {
            newColumn[`${hour}`] = {
                event: existingData.event,
                hour: existingData.hour,
                headerCol: existingData.headerCol,
                DBid: existingData.DBid,
            };
        } else {
            // Empty cell with header info only
            newColumn[`${hour}`] = {
                headerCol: columnData[0].headerCol,
                hour: hour,
            };
        }
    }

    return {
        ...initializedSchedule,
        [selectedDate]: {
            ...existingDate,
            [columnId]: newColumn
        }
    };
};
