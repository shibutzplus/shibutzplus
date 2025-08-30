export type CellType = "text" | "select" | "split" | "hour";

export type TeacherRow = {
    hour: number;
};

// TODO: no need all
export type ActionColumnType =
    | "publish"
    | "history"
    | "missingTeacher"
    | "existingTeacher"
    | "event"
    | "delete"
    | "update"
    | "move";
