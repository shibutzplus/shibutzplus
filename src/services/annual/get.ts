import { AnnualScheduleRequest } from "@/models/types/annualSchedule";
import { ClassType } from "@/models/types/classes";

export const getSelectedClass = (classes: ClassType[] | undefined, selectedClassId: string) => {
    return classes?.find((c) => c.id === selectedClassId);
};

// NOT IN USE
export const getUniqueCellsFromQueue = (queueRows: AnnualScheduleRequest[]) => {
    const cells = queueRows.map((row) => ({
        day: row.day,
        hour: row.hour,
    }));
    const uniqueCells = cells.filter(
        (cell, index) =>
            cells.findIndex((c) => c.day === cell.day && c.hour === cell.hour) === index,
    );
    return uniqueCells;
};
