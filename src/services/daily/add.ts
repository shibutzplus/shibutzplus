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
) => {
    const { hour, headerCol } = cellData;
    if (!school || event === undefined || !headerCol?.headerEvent) {
        return;
    }
    const dailyCellData: DailyScheduleRequest = {
        date: getStringReturnDate(selectedDate),
        day: getDayNumberByDateString(selectedDate).toString(),
        eventTitle: headerCol.headerEvent,
        issueTeacherType: ColumnTypeValues.event,
        columnId,
        hour,
        school,
        event,
        position: 0,
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
) => {
    const { hour, classes, subject, headerCol } = cellData;
    if (!school || !classes || !subject || !headerCol?.headerTeacher) return;

    const dailyCellDataRequests: DailyScheduleRequest = {
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
        subject,
        class: classes[0],
        classes,
        position: 0,
    };

    return dailyCellDataRequests;
};
