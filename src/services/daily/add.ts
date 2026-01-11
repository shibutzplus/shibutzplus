import {
    ColumnType,
    ColumnTypeValues,
    DailyScheduleCell,
    DailyScheduleRequest,
} from "@/models/types/dailySchedule";
import { SchoolType } from "@/models/types/school";
import { TeacherType } from "@/models/types/teachers";
import { getDayNumberByDateString, getStringReturnDate } from "@/utils/time";

/**
 * Creates a request object for adding a new event cell to the daily schedule.
 * @returns A `DailyScheduleRequest` object if valid, otherwise undefined.
 */
export const addNewEventCell = (
    school: SchoolType,
    cellData: DailyScheduleCell,
    columnId: string,
    selectedDate: string,
    event: string,
    position: number = 0,
) => {
    const { hour, headerCol } = cellData;
    if (!school || event === undefined || !headerCol?.headerEvent) {
        return;
    }
    const dailyCellData: DailyScheduleRequest = {
        date: getStringReturnDate(selectedDate),
        day: getDayNumberByDateString(selectedDate).toString(),
        eventTitle: headerCol.headerEvent,
        columnType: ColumnTypeValues.event,
        columnId,
        hour,
        school,
        event,
        position,
    };
    return dailyCellData;
};

/**
 * Creates a request object for adding a new teacher-related cell (e.g., substitution) to the daily schedule.
 *
 * This function constructs a `DailyScheduleRequest` payload for teacher columns. It handles
 * data for substitutions (`subTeacher`) or text notes (`text`), linking them to the specific
 * class, subject, and original teacher defined in the `cellData`.
 * @returns A `DailyScheduleRequest` object if valid, otherwise undefined.
 */
export const addNewTeacherValueCell = (
    school: SchoolType,
    cellData: DailyScheduleCell,
    columnId: string,
    selectedDate: string,
    type: ColumnType,
    subTeacher?: TeacherType,
    text?: string,
    position: number = 0,
) => {
    const { hour, classes, subject, headerCol } = cellData;
    if (!school || !classes || !subject || !headerCol?.headerTeacher) return;

    const dailyCellDataRequests: DailyScheduleRequest = {
        date: getStringReturnDate(selectedDate),
        day: getDayNumberByDateString(selectedDate).toString(),
        originalTeacher: headerCol.headerTeacher,
        columnType: type,
        eventTitle: undefined,
        event: text,
        subTeacher,
        columnId,
        hour,
        school,
        subject,
        classes,
        position,
    };

    return dailyCellDataRequests;
};
