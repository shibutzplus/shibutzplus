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
    classes?: ClassType[];
    subject?: SubjectType;
    originalTeacher?: TeacherType;
    columnType: ColumnType;
    subTeacher?: TeacherType;
    instructions?: string;
    position: number;
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
    classes?: ClassType[];
    subject?: SubjectType;
    originalTeacher?: TeacherType;
    columnType: ColumnType;
    subTeacher?: TeacherType;
    position: number;
    instructions?: string;
};

export type GetDailyScheduleResponse = ActionResponse & {
    data?: DailyScheduleType[];
};

export type HeaderCol = {
    headerTeacher?: TeacherType;
    headerEvent?: string;
    type: ColumnType;
    position?: number;
};

export type DailyScheduleCell = {
    DBid?: string;
    headerCol?: HeaderCol;
    subTeacher?: TeacherType;
    subject?: SubjectType;
    classes?: ClassType[];
    event?: string;
    hour: number;
};

export type DailySchedule = {
    [day: string]: {
        [columnId: string]: {
            [hour: string]: DailyScheduleCell;
        };
    };
};

export type TeacherHourlyScheduleItem = {
    hour: number;
    classes: ClassType[];
    subject: SubjectType;
    headerCol: HeaderCol;
};

export type GetTeacherScheduleResponse = ActionResponse & {
    data?: TeacherHourlyScheduleItem[];
};

export type GetTeacherByIdResponse = ActionResponse & {
    data?: TeacherType;
};

export const ActivityValues = {
    missingTeacher: "missing" as const,
    test: "test" as const,
    trip: "trip" as const,
    show: "show" as const,
    returns: "returns" as const,
    home: "home" as const,
};
export type ActivityOptions = (typeof ActivityValues)[keyof typeof ActivityValues];

export const ColumnTypeValues = {
    existingTeacher: "existingTeacher" as const,
    missingTeacher: "missingTeacher" as const,
    event: "event" as const,
    empty: "empty" as const,
};
export type ColumnType = keyof typeof ColumnTypeValues;

///---

export type TableColumn = {
    columnId: string;
    type: ColumnType;
};