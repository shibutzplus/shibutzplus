import { WeeklySchedule } from "@/models/types/annualSchedule";
import { DAYS_OF_WEEK, getDayNumberByDateString, getStringReturnDate, HOURS_IN_DAY } from "./time";
import {
    DailyScheduleCell,
    DailyScheduleRequest,
    DailyScheduleType,
} from "@/models/types/dailySchedule";

export const initializeEmptyAnnualSchedule = (
    newSchedule: WeeklySchedule,
    selectedClassId: string,
) => {
    // Initialize empty schedule structure
    newSchedule[selectedClassId] = {};
    DAYS_OF_WEEK.forEach((day) => {
        newSchedule[selectedClassId][day] = {};

        for (let hour = 1; hour <= HOURS_IN_DAY; hour++) {
            newSchedule[selectedClassId][day][hour] = {
                teachers: [],
                subjects: [],
            };
        }
    });
    return newSchedule;
};

export const initDailyTeacherCellData = (entry: DailyScheduleType) => {
    const cellData: DailyScheduleCell = {
        DBid: entry.id,
        hour: entry.hour,
        class: entry.class,
        subject: entry.subject,
        headerCol: { headerTeacher: entry.issueTeacher, type: entry.issueTeacherType },
    };

    if (entry.subTeacher) {
        cellData.subTeacher = entry.subTeacher;
        if (cellData.event) delete cellData.event;
    } else if (entry.event) {
        cellData.event = entry.event;
        if (cellData.subTeacher) delete cellData.subTeacher;
    }
    return cellData;
};

export const initDailyEventCellData = (entry: DailyScheduleType) => {
    const cellData: DailyScheduleCell = {
        DBid: entry.id,
        hour: entry.hour,
        event: entry.event,
        headerCol: { headerEvent: entry.eventTitle, type: "event" },
    };

    return cellData;
};

export const initDailyCellData = (
    row: DailyScheduleType,
    selectedDate: string,
    instructions?: string,
) => {
    const dailyCellData: DailyScheduleRequest = {
        date: getStringReturnDate(selectedDate),
        day: getDayNumberByDateString(selectedDate).toString(),
        columnId: row.columnId,
        hour: row.hour,
        school: row.school,
        class: row.class,
        subject: row.subject,
        subTeacher: row.subTeacher,
        issueTeacher: row.issueTeacher,
        issueTeacherType: row.issueTeacherType,
        position: row.position,
        instructions,
    }

    return dailyCellData
}

