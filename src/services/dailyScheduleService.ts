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
import {
    getDayNumberByDateString,
    HOURS_IN_DAY,
    getStringReturnDate,
    getDateReturnString,
} from "@/utils/time";

export const initDailySchedule = (dailySchedule: DailySchedule, date: string, columnId: string) => {
    // Initialize date if it doesn't exist
    if (!dailySchedule[date]) {
        dailySchedule[date] = {};
    }

    // Initialize header if it doesn't exist
    if (!dailySchedule[date][columnId]) {
        dailySchedule[date][columnId] = {};
    }

    return dailySchedule;
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
                headerTeacher: existingData.headerTeacher,
            };
        } else {
            // Empty cell
            dailySchedule[selectedDate][columnId][`${hour}`] = {
                headerTeacher: columnData[0].headerTeacher,
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
            headerTeacher: headerTeacher,
            hour: hour,
        };
    }
    return dailySchedule;
};

export const initCellData = (entry: DailyScheduleType) => {
    const cellData: DailyScheduleCell = {
        hour: entry.hour,
        class: entry.class,
        subject: entry.subject,
        event: entry.event,
        subTeacher: entry.subTeacher,
    };

    if (entry.absentTeacher) {
        cellData.headerTeacher = entry.absentTeacher;
    } else if (entry.presentTeacher) {
        cellData.headerTeacher = entry.presentTeacher;
    }

    return cellData;
};

export const createNewCellData = (
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

export const filterScheduleByDate = (
    dailyScheduleData: DailyScheduleType[],
    selectedDate: string,
) => {
    // Filter data to only include entries for the selected date
    const filteredData = dailyScheduleData?.filter((entry) => {
        const entryDateStr =
            entry.date instanceof Date
                ? getDateReturnString(entry.date)
                : getDateReturnString(new Date(entry.date));

        return entryDateStr === selectedDate;
    });

    return filteredData;
};

/**
 * Check if a column already exists in the daily schedule for a specific date
 * @param dailySchedule The current daily schedule state
 * @param date The date to check (YYYY-MM-DD format)
 * @param columnId The column ID to check for
 * @returns Boolean indicating if the column exists and has data
 */
export const columnExistsForDate = (
    dailySchedule: DailySchedule,
    date: string,
    columnId: string,
): boolean => {
    // Check if the date exists in the schedule
    if (!dailySchedule[date]) {
        return false;
    }

    // Check if the column exists for this date
    if (!dailySchedule[date][columnId]) {
        return false;
    }

    // Check if the column has any data (at least one hour entry)
    const hasData = Object.keys(dailySchedule[date][columnId]).length > 0;

    return hasData;
};

/**
 * Group daily schedule entries by date and column ID
 * @param filteredData The filtered schedule data for a specific date
 * @param selectedDate The selected date (YYYY-MM-DD format)
 * @returns Grouped entries by date and column ID
 */
export const groupScheduleEntriesByDateAndCol = (
    filteredData: DailyScheduleType[],
    selectedDate: string,
): Record<string, Record<string, DailyScheduleCell[]>> => {
    const entriesByDayAndHeader: Record<string, Record<string, DailyScheduleCell[]>> = {};

    filteredData?.forEach((entry) => {
        const columnId = entry.columnId;

        // Initialize grouping structure if needed
        if (!entriesByDayAndHeader[selectedDate]) {
            entriesByDayAndHeader[selectedDate] = {};
        }

        if (!entriesByDayAndHeader[selectedDate][columnId]) {
            entriesByDayAndHeader[selectedDate][columnId] = [];
        }

        const cellData = initCellData(entry);
        entriesByDayAndHeader[selectedDate][columnId].push(cellData);
    });

    return entriesByDayAndHeader;
};
