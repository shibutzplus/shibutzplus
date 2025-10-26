import { TableColumn, DailySchedule } from "@/models/types/dailySchedule";
import { ColumnTypeValues, ColumnType } from "@/models/types/dailySchedule";

// Sort columns by issueTeacherType in order: [existingTeacher], [missingTeacher], [event]
export const sortDailyColumnsByType = (columns: TableColumn[]) => {
    const getTypeOrder = (type: ColumnType) => {
        switch (type) {
            case ColumnTypeValues.missingTeacher:
                return 1;
            case ColumnTypeValues.existingTeacher:
                return 2;
            case ColumnTypeValues.event:
                return 3;
            default:
                return 4;
        }
    };

    const sortedCols = columns.sort((a, b) => {
        const aType = a.type as ColumnType;
        const bType = b.type as ColumnType;
        return getTypeOrder(aType) - getTypeOrder(bType);
    });
    return sortedCols;
};

// Sort column IDs by their type from the schedule data
export const sortDailyColumnIdsByType = (
    columnIds: string[],
    schedule: DailySchedule,
    selectedDate: string
) => {
    const getTypeOrder = (type: ColumnType) => {
        switch (type) {
            case ColumnTypeValues.existingTeacher:
                return 1;
            case ColumnTypeValues.missingTeacher:
                return 2;
            case ColumnTypeValues.event:
                return 3;
            default:
                return 4;
        }
    };

    const getColumnType = (columnId: string): ColumnType => {
        const column = schedule[selectedDate]?.[columnId];
        return column?.["1"]?.headerCol?.type || ColumnTypeValues.existingTeacher;
    };

    return columnIds.sort((a, b) => {
        const aType = getColumnType(a);
        const bType = getColumnType(b);
        return getTypeOrder(aType) - getTypeOrder(bType);
    });
};
