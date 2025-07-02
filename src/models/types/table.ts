import { ClassType } from "./classes";
import { SchoolType } from "./school";
import { SubjectType } from "./subjects";

export type CellType = "text" | "select" | "split" | "hour";

export type TeacherRow = {
    hour: number;
    school?: SchoolType;
    class?: ClassType;
    subject?: SubjectType;
};

export type ActionColumnType =
    | "publish"
    | "history"
    | "missingTeacher"
    | "existingTeacher"
    | "info"
    | "delete"
    | "update"
    | "move";
