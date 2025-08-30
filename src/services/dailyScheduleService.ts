import { eventPlaceholder } from "@/models/constant/table";
import { ClassType } from "@/models/types/classes";
import {
    ColumnType,
    DailySchedule,
    DailyScheduleCell,
    DailyScheduleRequest,
    DailyScheduleType,
} from "@/models/types/dailySchedule";
import { SchoolType } from "@/models/types/school";
import { SubjectType } from "@/models/types/subjects";
import { ActionColumnType } from "@/models/types/table";
import { TeacherType } from "@/models/types/teachers";
import { getDayNumberByDateString, HOURS_IN_DAY, getStringReturnDate } from "@/utils/time";

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
    // Check if this is an event column by looking at the first cell
    const isEventColumn = cells.length > 0 && cells[0].event !== undefined;

    if (isEventColumn) {
        setEventColumn(newSchedule, date, cells, columnId);
    } else {
        setTeacherColumn(newSchedule, date, cells, columnId);
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
                headerCol: existingData.headerCol,
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

export const setEmptyEventColumn = (
    dailySchedule: DailySchedule,
    selectedDate: string,
    eventTitle: string,
    columnId: string,
): DailySchedule => {
    dailySchedule = initDailySchedule(dailySchedule, selectedDate, columnId);

    for (let hour = 1; hour <= HOURS_IN_DAY; hour++) {
        dailySchedule[selectedDate][columnId][`${hour}`] = {
            headerCol: { headerEvent: eventTitle, type: "event" },
            hour: hour,
        };
    }

    return dailySchedule;
};

export const initTeacherCellData = (entry: DailyScheduleType) => {
    const cellData: DailyScheduleCell = {
        hour: entry.hour,
        class: entry.class,
        subject: entry.subject,
        headerCol: { headerTeacher: entry.issueTeacher, type: entry.issueTeacherType },
        subTeacher: entry.subTeacher,
    };
    return cellData;
};

export const initEventCellData = (entry: DailyScheduleType) => {
    const cellData: DailyScheduleCell = {
        hour: entry.hour,
        event: entry.event,
        headerCol: { headerEvent: entry.eventTitle, type: "event" },
    };

    return cellData;
};

export const createNewTeacherCellData = (
    type: ColumnType,
    selectedDate: string,
    columnId: string,
    hour: number,
    school: SchoolType,
    classData: ClassType,
    subject: SubjectType,
    subTeacher: TeacherType,
    headerTeacher: TeacherType,
    position: number,
) => {
    const cellData: DailyScheduleRequest = {
        date: getStringReturnDate(selectedDate),
        day: getDayNumberByDateString(selectedDate).toString(),
        issueTeacherType: type,
        issueTeacher: headerTeacher,
        subTeacher,
        columnId,
        hour,
        school,
        class: classData,
        subject,
        position,
    };
    return cellData;
};

export const createNewEventCellData = (
    selectedDate: string,
    columnId: string,
    hour: number,
    school: SchoolType,
    eventTitle: string,
    event: string,
    position: number,
) => {
    const cellData: DailyScheduleRequest = {
        date: getStringReturnDate(selectedDate),
        day: getDayNumberByDateString(selectedDate).toString(),
        issueTeacherType: "event",
        columnId,
        hour,
        school,
        eventTitle,
        event,
        position,
    };

    return cellData;
};

export const addNewEventCell = (
    school: SchoolType,
    cellData: DailyScheduleCell,
    columnId: string,
    selectedDate: string,
    event: string,
    position: number,
) => {
    const { hour, headerCol } = cellData;
    if (!school || event === undefined || !headerCol?.headerEvent) {
        return;
    }
    const dailyCellData: DailyScheduleRequest = createNewEventCellData(
        selectedDate,
        columnId,
        hour,
        school,
        headerCol.headerEvent,
        event,
        position,
    );
    return dailyCellData;
};

export const addNewSubTeacherCell = (
    school: SchoolType,
    cellData: DailyScheduleCell,
    columnId: string,
    selectedDate: string,
    subTeacher: TeacherType,
    type: ColumnType,
    position: number,
) => {
    const { hour, class: classData, subject, headerCol } = cellData;
    if (!school || !classData || !subject || !subTeacher || !headerCol?.headerTeacher) {
        return;
    }

    const dailyCellData: DailyScheduleRequest = createNewTeacherCellData(
        type,
        selectedDate,
        columnId,
        hour,
        school,
        classData,
        subject,
        subTeacher,
        headerCol.headerTeacher,
        position,
    );
    return dailyCellData;
};

export const addTeacherToExistingCells = (
    existingCells: { teacherId: string; hours: number[] }[],
    teacherId: string,
    hour: number,
) => {
    const existingTeacher = existingCells.find((item) => item.teacherId === teacherId);
    if (existingTeacher) {
        existingTeacher.hours.push(hour);
    } else {
        existingCells.push({ teacherId, hours: [hour] });
    }
};

export const getColumnsFromStorage = (storageData: {
    [header: string]: {
        [hour: string]: DailyScheduleCell;
    };
}) => {
    const columnsToCreate: { id: string; type: ActionColumnType }[] = [];
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
        existingCell.event = data.event || eventPlaceholder;
    } else if (data.subTeacher) {
        existingCell.subTeacher = data.subTeacher;
    }

    updatedSchedule[selectedDate][columnId][hourStr] = existingCell;
    return updatedSchedule;
};

export const populateTable = (dataColumns: DailyScheduleType[], selectedDate: string) => {
    const entriesByDayAndHeader: Record<string, Record<string, DailyScheduleCell[]>> = {};
    const columnsToCreate: { id: string; type: ActionColumnType }[] = [];
    const seenColumnIds = new Set<string>();
    let existingCells: { teacherId: string; hours: number[] }[] = [];

    for (const columnCell of dataColumns) {
        const columnId = columnCell.columnId;

        const { issueTeacher, issueTeacherType, hour } = columnCell;

        let cellData: DailyScheduleCell;
        if (issueTeacher) {
            addTeacherToExistingCells(existingCells, issueTeacher.id, hour);
            cellData = initTeacherCellData(columnCell);
        } else {
            cellData = initEventCellData(columnCell);
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
        existingCells,
    };
};
