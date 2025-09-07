import { eventPlaceholder } from "@/models/constant/table";
import { getDayNumberByDateString, HOURS_IN_DAY, getStringReturnDate } from "@/utils/time";
import {
    ColumnType,
    DailySchedule,
    DailyScheduleCell,
    DailyScheduleRequest,
    DailyScheduleType,
    HeaderCol,
} from "@/models/types/dailySchedule";
import { SchoolType } from "@/models/types/school";
import { TeacherType } from "@/models/types/teachers";
import { initDailyEventCellData, initDailyTeacherCellData } from "@/utils/Initialize";
import { AnnualScheduleType, AvailableTeachers } from "@/models/types/annualSchedule";

export const initDailySchedule = (dailySchedule: DailySchedule, date: string, columnId: string) => {
    // Initialize date if it doesn't exist
    if (!dailySchedule[date]) dailySchedule[date] = {};

    // Initialize header if it doesn't exist
    if (!dailySchedule[date][columnId]) dailySchedule[date][columnId] = {};

    return dailySchedule;
};

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

export const fillLeftRowsWithEmptyCells = (
    updatedSchedule: DailySchedule,
    selectedDate: string,
    columnId: string,
    headerCol?: HeaderCol | undefined,
) => {
    for (let hour = 1; hour <= HOURS_IN_DAY; hour++) {
        if (!updatedSchedule[selectedDate][columnId][`${hour}`]) {
            updatedSchedule[selectedDate][columnId][`${hour}`] = { headerCol, hour };
        }
    }
    return updatedSchedule;
};

export const setEmptyTeacherColumn = (
    dailySchedule: DailySchedule,
    selectedDate: string,
    headerTeacher: TeacherType,
    columnId: string,
    type: ColumnType,
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

export const updateAllEventHeader = (
    updatedSchedule: DailySchedule,
    selectedDate: string,
    columnId: string,
    eventTitle: string,
) => {
    for (let i = 1; i <= HOURS_IN_DAY; i++) {
        updatedSchedule[selectedDate][columnId][`${i}`].headerCol = {
            ...updatedSchedule[selectedDate][columnId][`${i}`].headerCol,
            headerEvent: eventTitle,
            type: "event",
        };
    }
    return updatedSchedule;
};

export const addNewEventCell = (
    school: SchoolType,
    cellData: DailyScheduleCell,
    columnId: string,
    selectedDate: string,
    event: string,
) => {
    const { hour, headerCol } = cellData;
    if (!school || event === undefined || !headerCol?.headerEvent) {
        return;
    }
    const dailyCellData: DailyScheduleRequest = {
        date: getStringReturnDate(selectedDate),
        day: getDayNumberByDateString(selectedDate).toString(),
        eventTitle: headerCol.headerEvent,
        issueTeacherType: "event",
        columnId,
        hour,
        school,
        event,
        position: 0,
    };
    return dailyCellData;
};

export const addNewTeacherValueCell = (
    school: SchoolType,
    cellData: DailyScheduleCell,
    columnId: string,
    selectedDate: string,
    type: ColumnType,
    subTeacher?: TeacherType,
    text?: string,
) => {
    const { hour, class: classData, subject, headerCol } = cellData;
    if (!school || !classData || !subject || !headerCol?.headerTeacher) return;
    //TODO: is it ok to remove this line for "empty cell"?
    // if (!subTeacher && !text) return;

    const dailyCellData: DailyScheduleRequest = {
        date: getStringReturnDate(selectedDate),
        day: getDayNumberByDateString(selectedDate).toString(),
        issueTeacher: headerCol.headerTeacher,
        issueTeacherType: type,
        eventTitle: undefined,
        event: text,
        subTeacher,
        columnId,
        hour,
        school,
        class: classData,
        subject,
        position: 0,
    };

    return dailyCellData;
};

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

export const updateAddCell = (
    responseId: string,
    mainDailyTable: DailySchedule,
    selectedDate: string,
    cellData: DailyScheduleCell,
    columnId: string,
    data: { event?: string; subTeacher?: TeacherType },
) => {
    // Update mainDailyTable with the new cell data
    const updatedSchedule = { ...mainDailyTable };
    if (!updatedSchedule[selectedDate]) {
        updatedSchedule[selectedDate] = {};
    }
    if (!updatedSchedule[selectedDate][columnId]) {
        updatedSchedule[selectedDate][columnId] = {};
    }

    const hourStr = cellData.hour.toString();
    const existingCell = updatedSchedule[selectedDate][columnId][hourStr] || {
        ...cellData,
    };

    if (data.event) {
        existingCell.DBid = responseId;
        existingCell.event = data.event || eventPlaceholder;
        delete existingCell.subTeacher;
    } else if (data.subTeacher) {
        existingCell.DBid = responseId;
        existingCell.subTeacher = data.subTeacher;
        delete existingCell.event;
    }

    updatedSchedule[selectedDate][columnId][hourStr] = existingCell;
    return updatedSchedule;
};

export const updateDeleteCell = (
    deletedRowId: string,
    mainDailyTable: DailySchedule,
    selectedDate: string,
    cellData: DailyScheduleCell,
    columnId: string,
) => {
    // Update mainDailyTable by removing the deleted cell data
    const updatedSchedule = { ...mainDailyTable };
    if (!updatedSchedule[selectedDate] || !updatedSchedule[selectedDate][columnId]) {
        return updatedSchedule;
    }

    const hourStr = cellData.hour.toString();
    const existingCell = updatedSchedule[selectedDate][columnId][hourStr];

    if (existingCell && existingCell.DBid === deletedRowId) {
        // Clear the cell data but keep the header structure
        updatedSchedule[selectedDate][columnId][hourStr] = {
            headerCol: existingCell.headerCol,
            hour: existingCell.hour,
        };
    }

    return updatedSchedule;
};

export const populateTable = (dataColumns: DailyScheduleType[], selectedDate: string) => {
    const entriesByDayAndHeader: Record<string, Record<string, DailyScheduleCell[]>> = {};
    const columnsToCreate: { id: string; type: ColumnType }[] = [];
    const seenColumnIds = new Set<string>();

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
        if (!seenColumnIds.has(columnId)) {
            columnsToCreate.push({
                id: columnId,
                type: issueTeacherType,
            });
            seenColumnIds.add(columnId);
        }

        if (!entriesByDayAndHeader[selectedDate]) {
            entriesByDayAndHeader[selectedDate] = {};
        }
        if (!entriesByDayAndHeader[selectedDate][columnId]) {
            entriesByDayAndHeader[selectedDate][columnId] = [];
        }

        entriesByDayAndHeader[selectedDate][columnId].push(cellData);
    }

    return {
        entriesByDayAndHeader,
        columnsToCreate,
    };
};

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
