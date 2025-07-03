import { ActionResponse } from "./actions";
import { ClassType } from "./classes";
import { SubjectType } from "./subjects";

export type TeacherType = {
    id: string;
    name: string;
    role: TeacherRole;
    schoolId: string;
    userId?: string | null;
};

export type TeacherRequest = {
    name: string;
    role: TeacherRole;
    schoolId: string;
    userId?: string | null;
};

export type GetTeachersResponse = ActionResponse & {
    data?: TeacherType[];
};

export const TeacherRoleValues = {
    REGULAR: "regular" as const,
    SUBSTITUTE: "substitute" as const,
};
export type TeacherRole = (typeof TeacherRoleValues)[keyof typeof TeacherRoleValues];
