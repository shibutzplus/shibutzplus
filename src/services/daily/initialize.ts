import {
    ColumnTypeValues,
    DailyScheduleCell,
    DailyScheduleType,
} from "@/models/types/dailySchedule";

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
        headerCol: { headerEvent: entry.eventTitle, type: ColumnTypeValues.event },
    };

    return cellData;
};
