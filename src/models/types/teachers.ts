import { ActionResponse } from "./actions";

export type TeacherType = {
    id: string;
    name: string;
    role: TeacherRole;
    schoolId: string;
};

export type TeacherRequest = {
    name: string;
    role: TeacherRole;
    schoolId: string;
};

export type GetTeachersResponse = ActionResponse & {
    data?: TeacherType[];
};

export const TeacherRoleValues = {
    REGULAR: "regular" as const,
    SUBSTITUTE: "substitute" as const,
    STAFF: "staff" as const,
};
export type TeacherRole = (typeof TeacherRoleValues)[keyof typeof TeacherRoleValues];
