export interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  classes: string[];
}

export interface TeacherFormData {
  firstName: string;
  lastName: string;
  role: string;
  classes: string;
}

export interface TeacherFormProps {
  onSubmit: (teacher: Teacher) => void;
  isLoading?: boolean;
}

export type TeacherRole = "מורה קיים" | "מורה מחליף";

export interface TeacherAddFormData {
  firstName: string;
  lastName: string;
  role: TeacherRole;
  classes: string[];
}

export interface ClassOption {
  value: string;
  label: string;
}
