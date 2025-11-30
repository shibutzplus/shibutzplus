import { DailySchedule, DailyScheduleCell } from "@/models/types/dailySchedule";
import { sortDailyColumnIdsByType } from "@/utils/sort";
import { useEffect, useRef, useState } from "react";

// After action (adding, removing, changing)
// Check if the amount of columns is the same
// If not, sort the columns
export const useSortColumns = (
    schedule: {
        [columnId: string]: {
            [hour: string]: DailyScheduleCell;
        };
    },
    mainDailyTable: DailySchedule,
    selectedDate: string,
    tableColumns: string[],
) => {
    const [sortedTableColumns, setSortedTableColumns] = useState<string[]>([]);
    const prevColumnsRef = useRef<string[]>([]);

    useEffect(() => {
        const currentIds = new Set(tableColumns);
        const prevIds = new Set(prevColumnsRef.current);

        const isSameAmountOfColumns =
            currentIds.size === prevIds.size && [...currentIds].every((id) => prevIds.has(id));

        if (!isSameAmountOfColumns) {
            const sorted = schedule
                ? sortDailyColumnIdsByType(tableColumns, mainDailyTable, selectedDate)
                : [];
            setSortedTableColumns(sorted);
            prevColumnsRef.current = tableColumns;
        }
    }, [tableColumns, mainDailyTable, selectedDate, schedule]);

    return sortedTableColumns;
};
