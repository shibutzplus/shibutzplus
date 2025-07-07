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
import { getColumnDate } from "@/utils/time";

export const setTeacherColumn = (
    dailySchedule: DailySchedule,
    date: string,
    columnData: DailyScheduleCell[],
    headerId: string,
) => {
    // Initialize date if it doesn't exist
    if (!dailySchedule[date]) {
        dailySchedule[date] = {};
    }

    // Initialize header if it doesn't exist
    if (!dailySchedule[date][headerId]) {
        dailySchedule[date][headerId] = {};
    }

    // Add schedule entries for each hour
    columnData.forEach((row) => {
        dailySchedule[date][headerId][`${row.hour}`] = {
            class: row.class,
            subject: row.subject,
            hour: row.hour,
            subTeacher: row.subTeacher,
            headerTeacher: row.headerTeacher,
        };
    });

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
        date: getColumnDate(Number(selectedDate)),
        day: selectedDate,
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
        // Convert Date object to string format (YYYY-MM-DD) for comparison
        const entryDateStr =
            entry.date instanceof Date
                ? entry.date.toISOString().split("T")[0]
                : new Date(entry.date).toISOString().split("T")[0];

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
