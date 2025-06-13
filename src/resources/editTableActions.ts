import { CellType, Colors } from "@/models/types/table";

interface IAction {
    thType: CellType;
    tdType: CellType;
    color: Colors;
}

export const editTableActions = {
    missingTeacher: {
        thType: "select",
        tdType: "select",
        color: "red",
    } as IAction,
    existingTeacher: {
        thType: "select",
        tdType: "select",
        color: "yellow",
    } as IAction,
    info: {
        thType: "text",
        tdType: "text",
        color: "green",
    } as IAction,
};

