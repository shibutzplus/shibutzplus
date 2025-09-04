import { ClassType } from "./classes";
import { SchoolType } from "./school";
import { TeacherType } from "./teachers";
import { SubjectType } from "./subjects";
import { ActionResponse } from "./actions";

export type DailyScheduleType = {
    id: string
    date: Date
    day: string // 1-7
    hour: number // 1-7
    columnId: string
    eventTitle?: string
    event?: string
    school: SchoolType
    class?: ClassType
    subject?: SubjectType
    issueTeacher?: TeacherType
    issueTeacherType: ColumnType
    subTeacher?: TeacherType
    instructions?: string
    position: number
    createdAt?: Date
    updatedAt?: Date
}

export type DailyScheduleRequest = {
    date: Date
    day: string // 1-7
    hour: number
    columnId: string
    eventTitle?: string
    event?: string
    school: SchoolType
    class?: ClassType
    subject?: SubjectType
    issueTeacher?: TeacherType
    issueTeacherType: ColumnType
    subTeacher?: TeacherType
    position: number
    instructions?: string
}

export type GetDailyScheduleResponse = ActionResponse & {
    data?: DailyScheduleType[];
};

export type ColumnType = "existingTeacher" | "event" | "missingTeacher";

export interface ScheduleColumn {
    id: string;
    type: ColumnType;
    title: string;
}

export type HeaderCol = {
    headerTeacher?: TeacherType;
    headerEvent?: string;
    type: ColumnType;
}

export type DailyScheduleCell = {
    DBid?: string;
    headerCol?: HeaderCol;
    subTeacher?: TeacherType;
    subject?: SubjectType;
    class?: ClassType;
    event?: string;
    hour: number;
};

export type DailySchedule = {
    [day: string]: {
        [header: string]: {
            [hour: string]: DailyScheduleCell;
        };
    };
};

export type TeacherHourlyScheduleItem = {
    hour: number;
    class: ClassType;
    subject: SubjectType;
    headerCol: HeaderCol;
};

export type GetTeacherScheduleResponse = ActionResponse & {
    data?: TeacherHourlyScheduleItem[];
};
