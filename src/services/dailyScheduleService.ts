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
) => {
    dailySchedule = initDailySchedule(dailySchedule, selectedDate, columnId);

    for (let hour = 1; hour <= HOURS_IN_DAY; hour++) {
        dailySchedule[selectedDate][columnId][`${hour}`] = {
            headerCol: { headerTeacher },
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
            headerCol: { headerEvent: eventTitle },
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
        subTeacher: entry.subTeacher,
    };

    if (entry.absentTeacher) cellData.headerCol = { headerTeacher: entry.absentTeacher };
    else if (entry.presentTeacher) cellData.headerCol = { headerTeacher: entry.presentTeacher };

    return cellData;
};

export const initEventCellData = (entry: DailyScheduleType) => {
    const cellData: DailyScheduleCell = {
        hour: entry.hour,
        event: entry.event,
        headerCol: { headerEvent: entry.eventTitle },
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
) => {
    const cellData: DailyScheduleRequest = {
        date: getStringReturnDate(selectedDate),
        day: getDayNumberByDateString(selectedDate).toString(),
        columnId,
        hour,
        school,
        class: classData,
        subject,
        subTeacher,
    };

    if (type === "existingTeacher") {
        cellData.presentTeacher = headerTeacher;
    } else if (type === "missingTeacher") {
        cellData.absentTeacher = headerTeacher;
    }

    return cellData;
};

export const createNewEventCellData = (
    selectedDate: string,
    columnId: string,
    hour: number,
    school: SchoolType,
    eventTitle: string,
    event: string,
) => {
    const cellData: DailyScheduleRequest = {
        date: getStringReturnDate(selectedDate),
        day: getDayNumberByDateString(selectedDate).toString(),
        columnId,
        hour,
        school,
        eventTitle,
        event,
    };

    return cellData;
};

// TODO: not in use
/**
 * Group daily schedule entries by date and column ID
 * @param filteredData The filtered schedule data for a specific date
 * @param selectedDate The selected date (YYYY-MM-DD format)
 * @returns Grouped entries by date and column ID
 */
export const groupScheduleEntriesByDateAndCol = async (
    filteredData: DailyScheduleType[],
    selectedDate: string,
): Promise<Record<string, Record<string, DailyScheduleCell[]>>> => {
    const entriesByDayAndHeader: Record<string, Record<string, DailyScheduleCell[]>> = {};

    for (const entry of filteredData) {
        const columnId = entry.columnId;

        // Initialize grouping structure if needed
        if (!entriesByDayAndHeader[selectedDate]) {
            entriesByDayAndHeader[selectedDate] = {};
        }

        if (!entriesByDayAndHeader[selectedDate][columnId]) {
            entriesByDayAndHeader[selectedDate][columnId] = [];
        }

        // if(entriesByDayAndHeader[selectedDate][columnId].length === 0){
        //     let emptyRows;
        //     const teacherId = entry.absentTeacher ? entry.absentTeacher.id : entry.presentTeacher?.id;
        //     if (teacherId && entry.school) {
        //         const response = await getTeacherScheduleByDayAction(
        //             entry.school.id,
        //             getDayNumberByDateString(selectedDate),
        //             teacherId,
        //         );
        //         if (response && response.data) {
        //             emptyRows = response.data.filter((row) => row.hour !== entry.hour);
        //             emptyRows.forEach((row) => {
        //                 const cellData: DailyScheduleCell = {
        //                     hour: row.hour,
        //                     class: row.class,
        //                     subject: row.subject,
        //                     headerTeacher: row.headerTeacher
        //                 };
        //                 entriesByDayAndHeader[selectedDate][columnId].push(cellData);
        //             });
        //         }
        //     }
        // }
        const cellData = initTeacherCellData(entry);
        entriesByDayAndHeader[selectedDate][columnId].push(cellData);
    }

    return entriesByDayAndHeader;
};

export const addNewEventCell = (
    school: SchoolType,
    cellData: DailyScheduleCell,
    columnId: string,
    selectedDate: string,
    event: string,
) => {
    const { hour, headerCol } = cellData;

    if (!school || !event || !headerCol?.headerEvent) {
        return;
    }

    const dailyCellData: DailyScheduleRequest = createNewEventCellData(
        selectedDate,
        columnId,
        hour,
        school,
        headerCol.headerEvent,
        event,
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
    );
    return dailyCellData;
};
