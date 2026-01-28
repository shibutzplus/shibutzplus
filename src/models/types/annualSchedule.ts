import { ActionResponse } from "./actions";
import { ClassType } from "./classes";
import { SchoolType } from "./school";
import { SubjectType } from "./subjects";
import { TeacherType } from "./teachers";


export type AnnualScheduleType = {
    id: string;
    day: number; // 1-7 representing days of the week
    hour: number; // period within the day
    school?: SchoolType; // Optional
    schoolId?: string;   // Added
    class?: ClassType;   // Optional
    classId?: string;    // Added
    teacher?: TeacherType; // Optional
    teacherId?: string;    // Added
    subject?: SubjectType; // Optional
    subjectId?: string;    // Added
    createdAt?: Date;
    updatedAt?: Date;
};

export type AnnualScheduleRequest = {
    day: number;
    hour: number;
    school: SchoolType;
    class: ClassType;
    teacher: TeacherType;
    subject: SubjectType;
};

export type GetAnnualScheduleResponse = ActionResponse & {
    data?: AnnualScheduleType[];
};

export type AnnualScheduleCell = {
    teachers: string[];
    subjects: string[];
    classes: string[];
};

// TODO: can be [className: string] or [teacherName: string]
export type WeeklySchedule = {
    [className: string]: {
        [day: string]: {
            [hour: string]: AnnualScheduleCell;
        };
    };
};

export type AvailableTeachers = {
    [day: string]: {
        [hour: string]: string[];
    };
};

export type TeacherClassMap = {
    [day: string]: {
        [hour: string]: {
            [teacherId: string]: string; // value is classId
        };
    };
};

export type AnnualInputCellType = "teachers" | "subjects" | "classes";
