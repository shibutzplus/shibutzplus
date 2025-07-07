import { ClassType } from "./classes";
import { SchoolType } from "./school";
import { TeacherType } from "./teachers";
import { SubjectType } from "./subjects";
import { ActionResponse } from "./actions";

export type DailyScheduleType = {
    id: string;
    date: Date;
    day: string; // 1-7
    hour: number; // 1-7
    columnId: string;
    eventTitle?: string;
    event?: string;
    school: SchoolType;
    class: ClassType;
    subject: SubjectType;
    absentTeacher?: TeacherType;
    presentTeacher?: TeacherType;
    subTeacher?: TeacherType;
    createdAt?: Date;
    updatedAt?: Date;
};

export type DailyScheduleRequest = {
    date: Date;
    day: string; // 1-7
    hour: number;
    columnId: string;
    eventTitle?: string;
    event?: string;
    school: SchoolType;
    class: ClassType;
    subject: SubjectType;
    absentTeacher?: TeacherType;
    presentTeacher?: TeacherType;
    subTeacher?: TeacherType;
};

export type GetDailyScheduleResponse = ActionResponse & {
    data?: DailyScheduleType[];
};

export type ColumnType = "existingTeacher" | "info" | "missingTeacher";

export interface ScheduleColumn {
    id: string;
    type: ColumnType;
    title: string;
}

export type DailyScheduleCell = {
    headerTeacher?: TeacherType;
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
    headerTeacher: TeacherType;
};

export type GetTeacherScheduleResponse = ActionResponse & {
    data?: TeacherHourlyScheduleItem[];
};
