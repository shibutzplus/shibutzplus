"use client";

import { ColumnType, TableColumn } from "@/models/types/dailySchedule";
import { generateId } from "@/utils";
import { sortDailyColumnsByType } from "@/utils/sortP";
import { useState } from "react";
// TODO: not in use
const useDailyTableActions = () => {
    const [tableColumns, setTableColumns] = useState<TableColumn[]>([]);

    const buildNewColumn = (type: ColumnType): TableColumn => {
        const columnId = `${type}-${generateId()}`;
        return { columnId, type };
    };

    const addNewColumn = (colType: ColumnType) => {
        const newCol = buildNewColumn(colType);
        const sortedCols = sortDailyColumnsByType([...tableColumns, newCol]);
        setTableColumns(sortedCols);
    };

    const addColumns = (
        columnsToCreate: {
            id: string;
            type: ColumnType;
        }[],
    ) => {
        const newColumns = columnsToCreate.map(({ id, type }) => {
            return buildNewColumn(type);
        });
        const sortedColumnDefs = sortDailyColumnsByType(newColumns);
        setTableColumns(sortedColumnDefs);
    };

    const deleteColumn = async (columnId: string) => {
        const filteredCols = tableColumns.filter((col) => col.columnId !== columnId);
        setTableColumns(filteredCols);
        return true;
    };

    const clearDailySchedule = () => {
        setTableColumns([]);
    };

    return {
        tableColumns,
        addNewColumn,
        addColumns,
        deleteColumn,
        clearDailySchedule,
    };
};

export default useDailyTableActions;
