import { DailySchedule, DailyScheduleCell } from "@/models/types/dailySchedule";

export const setTeacherColumn = (
    dailySchedule: DailySchedule,
    day: string,
    columnData: DailyScheduleCell[],
    headerId: string,
) => {
    // Initialize day if it doesn't exist
    if (!dailySchedule[day]) {
        dailySchedule[day] = {};
    }

    // Initialize header if it doesn't exist
    if (!dailySchedule[day][headerId]) {
        dailySchedule[day][headerId] = {};
    }

    // Add schedule entries for each hour
    columnData.forEach((row) => {
        dailySchedule[day][headerId][`${row.hour}`] = {
            class: row.class,
            subject: row.subject,
            hour: row.hour,
            subTeacher: row.subTeacher,
        };
    });

    return dailySchedule;
};
