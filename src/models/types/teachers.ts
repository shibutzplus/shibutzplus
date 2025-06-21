export type TeacherType = {
  id: string;
  name: string;
  role: TeacherRole;
  schoolId: string;
  userId?: string | null;
}

export type TeacherRequest = {
  name: string;
  role: TeacherRole;
  schoolId: string;
  userId?: string | null;
}

export const TeacherRoleValues = {
  HOMEROOM: "homeroom" as const,
  SUBSTITUTE: "substitute" as const,
};
export type TeacherRole = typeof TeacherRoleValues[keyof typeof TeacherRoleValues];
