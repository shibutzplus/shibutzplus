import { ClassType } from "./classes";
import { SchoolType } from "./school";
import { SubjectType } from "./subjects";
import { TeacherType } from "./teachers";

export type PortalScheduleType = {
    hour: number; // 1-7
    school?: SchoolType;
    class?: ClassType;
    subject?: SubjectType;
    subTeacher?: TeacherType;
    instructions?: string;
    links?: string;
};
