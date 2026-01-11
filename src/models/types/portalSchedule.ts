import { ClassType } from "./classes";
import { SchoolType } from "./school";
import { SubjectType } from "./subjects";
import { TeacherType } from "./teachers";

export type TeacherScheduleType = {
    DBid: string;
    columnId: string;
    hour: number; // 1-7
    schoolId?: string;
    school?: SchoolType;
    classes?: ClassType[];
    subject?: SubjectType;
    originalTeacher?: TeacherType;
    subTeacher?: TeacherType;
    event?: string;
    instructions?: string;
    secondary?: TeacherScheduleType;
};

export type PortalSchedule = {
    [day: string]: {
        [hour: string]: TeacherScheduleType;
    };
};
