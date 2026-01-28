import { ClassType } from "./classes";
import { SchoolType } from "./school";
import { TeacherType } from "./teachers";
import { SubjectType } from "./subjects";
import { ActionResponse } from "./actions";

export type DailyScheduleType = {
    id: string;
    date: Date;
    day: number; // 1-7
    hour: number; // 1-7
    columnId: string;
    eventTitle?: string;
    event?: string;
    school?: SchoolType; // Made optional
    schoolId?: string;   // Added
    classes?: ClassType[];
    classIds?: string[]; // Added
    subject?: SubjectType;
    subjectId?: string;  // Added
    originalTeacher?: TeacherType;
    originalTeacherId?: string; // Added
    columnType: ColumnType;
    subTeacher?: TeacherType;
    subTeacherId?: string; // Added
    instructions?: string;
    position: number;
    createdAt?: Date;
    updatedAt?: Date;
    isRegular?: boolean;
};

export type DailyScheduleRequest = {
    date: Date;
    day: number;
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

export const ColumnTypeValues = {
    missingTeacher: 0,
    existingTeacher: 1,
    event: 2,
} as const;
export type ColumnType = 0 | 1 | 2;

///---

export type TableColumn = {
    columnId: string;
    type: ColumnType;
};