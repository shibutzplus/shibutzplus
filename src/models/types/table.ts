export type Colors = "red" | "yellow" | "green" | "blue";

export type CellType = "text" | "select" | "split";

export type TableAction = "missingTeacher" | "existingTeacher" | "info";

export type Col = {
    id: number;
    action: TableAction;
    cells: Cell[];
    type: CellType;
};

export type Cell = {
    id: number;
    type: CellType;
    content: string;
};


// export type Row = {
//     cells: Cell;
// };

