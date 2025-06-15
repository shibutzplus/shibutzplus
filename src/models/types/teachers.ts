export interface Teacher {
  id: string;
  name: string;
  role: string;
  subject?: string;
  classes: string[];
  notes?: string;
}

export interface TeacherFormData {
  name: string;
  role: string;
  subject: string;
  classes: string;
  notes: string;
}

export interface TeacherFormProps {
  onSubmit: (teacher: Teacher) => void;
  isLoading?: boolean;
}

export type TeacherRole = "מורה קיים" | "מורה מחליף";

export interface TeacherAddFormData {
  name: string;
  role: TeacherRole;
  classes: string[];
}

export interface ClassOption {
  value: string;
  label: string;
}
