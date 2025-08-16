export type CellType = "text" | "select" | "split" | "hour";

export type TeacherRow = {
    hour: number;
};

export type ActionColumnType =
    | "publish"
    | "history"
    | "missingTeacher"
    | "existingTeacher"
    | "event"
    | "delete"
    | "update"
    | "move";
