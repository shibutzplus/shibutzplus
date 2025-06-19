export type Teacher = {
  id: string;
  name: string;
  role: TeacherRole;
  primaryClass: string;
}

export type TeacherRequest = {
  name: string;
  role: TeacherRole;
  primaryClass: string;
}

export const TeacherRoleValues = {
  EXISTING: "מורה קיים" as const,
  SUBSTITUTE: "מורה מחליף" as const,
};
export type TeacherRole = typeof TeacherRoleValues[keyof typeof TeacherRoleValues];
