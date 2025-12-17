import { AnnualScheduleType, AvailableTeachers } from "@/models/types/annualSchedule";
import {
    DailySchedule,
    DailyScheduleCell,
    DailyScheduleType,
    HeaderCol,
} from "@/models/types/dailySchedule";
import { initDailyEventCellData, initDailyTeacherCellData } from "@/services/daily/initialize";
import { HOURS_IN_DAY } from "@/utils/time";
import { setColumn } from "./setColumn";
import { setEmptyColumn } from "./setEmpty";

export const initDailySchedule = (dailySchedule: DailySchedule, date: string, columnId: string) => {
    // Check if we need to initialize anything
    const hasDate = !!dailySchedule[date];
    const hasColumn = hasDate && !!dailySchedule[date][columnId];

    if (hasDate && hasColumn) {
        return dailySchedule;
    }

    return {
        ...dailySchedule,
        [date]: {
            ...(dailySchedule[date] || {}),
            [columnId]: dailySchedule[date]?.[columnId] || {}
        }
    };
};

/**
 * Transforms a flat list of daily schedule columns into a structured, nested object format.
 */
export const populateTable = (dataColumns: DailyScheduleType[], selectedDate: string) => {
    const entriesByDayAndHeader: Record<string, Record<string, DailyScheduleCell[]>> = {};


    for (const columnCell of dataColumns) {
        const columnId = columnCell.columnId;

        const { issueTeacher, issueTeacherType } = columnCell;

        let cellData: DailyScheduleCell;
        if (issueTeacher) {
            cellData = initDailyTeacherCellData(columnCell);
        } else {
            cellData = initDailyEventCellData(columnCell);
        }
        // If the column is not already in the columnsToCreate array, add it


        if (!entriesByDayAndHeader[selectedDate]) {
            entriesByDayAndHeader[selectedDate] = {};
        }
        if (!entriesByDayAndHeader[selectedDate][columnId]) {
            entriesByDayAndHeader[selectedDate][columnId] = [];
        }

        entriesByDayAndHeader[selectedDate][columnId].push(cellData);
    }

    return entriesByDayAndHeader;
};

/**
 * Ensures that all hourly slots in a specific daily schedule column are populated.
 */
export const fillLeftRowsWithEmptyCells = (
    updatedSchedule: DailySchedule,
    selectedDate: string,
    columnId: string,
    headerCol?: HeaderCol | undefined,
    hoursNum: number = HOURS_IN_DAY,
) => {
    // If not exists, return original (or handle error, but usually implies init was done)
    if (!updatedSchedule[selectedDate] || !updatedSchedule[selectedDate][columnId]) {
        return updatedSchedule;
    }

    const existingDate = updatedSchedule[selectedDate];
    const existingColumn = existingDate[columnId];

    // Check if we actually need to add any cells
    let needsUpdate = false;
    for (let hour = 1; hour <= hoursNum; hour++) {
        if (!existingColumn[`${hour}`]) {
            needsUpdate = true;
            break;
        }
    }

    if (!needsUpdate) return updatedSchedule;

    const newColumn = { ...existingColumn };
    for (let hour = 1; hour <= hoursNum; hour++) {
        if (!newColumn[`${hour}`]) {
            newColumn[`${hour}`] = { headerCol, hour };
        }
    }

    return {
        ...updatedSchedule,
        [selectedDate]: {
            ...existingDate,
            [columnId]: newColumn
        }
    };
};

/**
 * Maps annual schedule data into a structured format of available teachers.
 */
export const mapAnnualTeachers = (data: AnnualScheduleType[]) => {
    const teacherMapping: AvailableTeachers = {};

    data.forEach((schedule) => {
        const day = schedule.day.toString();
        const hour = schedule.hour.toString();
        const teacherId = schedule.teacher?.id;

        if (!teacherMapping[day]) {
            teacherMapping[day] = {};
        }
        if (!teacherMapping[day][hour]) {
            teacherMapping[day][hour] = [];
        }
        if (teacherId && !teacherMapping[day][hour].includes(teacherId)) {
            teacherMapping[day][hour].push(teacherId);
        }
    });

    return teacherMapping;
};

/**
 * Maps annual schedule data into a structured format of teacher locations (which class they are in).
 */
export const mapAnnualTeacherClasses = (data: AnnualScheduleType[]) => {
    const teacherClassMap: any = {};

    data.forEach((schedule) => {
        const day = schedule.day.toString();
        const hour = schedule.hour.toString();
        const teacherId = schedule.teacher?.id;
        const classId = schedule.class?.id;

        if (!teacherId || !classId) return;

        if (!teacherClassMap[day]) {
            teacherClassMap[day] = {};
        }
        if (!teacherClassMap[day][hour]) {
            teacherClassMap[day][hour] = {};
        }

        teacherClassMap[day][hour][teacherId] = classId;
    });

    return teacherClassMap;
};

/**
 * Populates the main daily schedule table with data for a specific date.
 */
export const populateDailyScheduleTable = async (
    mainDailyTable: DailySchedule,
    selectedDate: string,
    dataColumns: DailyScheduleType[],
    hoursNum: number = HOURS_IN_DAY,
) => {
    try {
        if (!dataColumns) return;
        if (dataColumns.length === 0) {
            return setEmptyColumn(mainDailyTable, selectedDate);
        }

        const entriesByDayAndHeader = populateTable(dataColumns, selectedDate);

        let newSchedule: DailySchedule = {};

        Object.entries(entriesByDayAndHeader).forEach(([date, headerEntries]) => {
            Object.entries(headerEntries).forEach(([columnId, cells]) => {
                newSchedule = setColumn(cells, newSchedule, columnId, date, hoursNum);
            });
        });

        return newSchedule;
    } catch (error) {
        console.error("Error processing daily schedule data:", error);
    }
};
