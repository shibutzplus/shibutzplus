import { ActionResponse } from "./actions";
import { ClassType } from "./classes";
import { SchoolType } from "./school";
import { SubjectType } from "./subjects";
import { TeacherType } from "./teachers";

export type AnnualScheduleType = {
    id: string;
    day: number; // 1-7 representing days of the week
    hour: number; // period within the day
    position: string; // concatenation day + '-hour' + hour (e.g. "day2-hour3")
    school: SchoolType;
    class: ClassType;
    teacher: TeacherType;
    subject: SubjectType;
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
    teacher: string;
    subject: string;
};

export type WeeklySchedule = {
    [className: string]: {
        [day: string]: {
            [hour: string]: AnnualScheduleCell;
        };
    };
};
