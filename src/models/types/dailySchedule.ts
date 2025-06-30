import { ClassType } from "./classes";
import { SchoolType } from "./school";
import { TeacherType } from "./teachers";
import { SubjectType } from "./subjects";
import { ActionResponse } from "./actions";

export type DailyScheduleType = {
    id: string;
    date: string;
    hour: number; // period number
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
    date: string;
    hour: number;
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
    teacherId?: string;
    subjectId?: string;
    classId?: string;
    event?: string;
};

export type DailySchedule = {
    [day: string]: {
        [header: string]: {
            [hour: string]: DailyScheduleCell;
        };
    };
};