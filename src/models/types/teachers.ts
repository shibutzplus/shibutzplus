export type Teacher = {
  id: string;
  name: string;
  role: TeacherRole;
  subject?: string;
  classes: string[];
  notes?: string;
}

export type TeacherRequest = {
  name: string;
  role: TeacherRole;
  subject: string;
  classes: string;
  notes: string;
}

export const TeacherRoleValues = {
  EXISTING: "מורה קיים" as const,
  SUBSTITUTE: "מורה מחליף" as const,
};
export type TeacherRole = typeof TeacherRoleValues[keyof typeof TeacherRoleValues];
