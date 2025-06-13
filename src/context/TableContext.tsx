"use client";

import { TableRows } from "@/models/constant/table";
import { Cell, Col } from "@/models/types/table";
import { editTableActions } from "@/resources/editTableActions";
import React, { createContext, useContext, useState, ReactNode, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  VisibilityState,
  flexRender,
} from "@tanstack/react-table";

// Define the data structure for our table rows
export type TableRow = {
  day: number;
  [key: string]: any; // Dynamic columns will be added here
};

interface TableContextType {
  cols: Col[];
  data: TableRow[];
  columns: ColumnDef<TableRow>[];
  columnVisibility: VisibilityState;
  addNewCol: (action: any) => void;
  removeCol: (id: number) => void;
  getTable: () => ReturnType<typeof useReactTable<TableRow>>;
  scale: number;
  setScale: (scale: number) => void;
}

const TableContext = createContext<TableContextType | undefined>(undefined);

export const useTableContext = () => {
  const context = useContext(TableContext);
  if (context === undefined) {
    throw new Error("useTableContext must be used within a TableContextProvider");
  }
  return context;
};

interface TableContextProviderProps {
  children: ReactNode;
}

export const TableContextProvider: React.FC<TableContextProviderProps> = ({ children }) => {
  // Store the original columns structure for compatibility with TableActions
  const [cols, setCols] = useState<Col[]>([]);
  
  // Column visibility state for TanStack Table
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  
  // Scale factor for the table
  const [scale, setScale] = useState<number>(1);
  
  // Generate initial data with day numbers
  const [data, setData] = useState<TableRow[]>(
    Array.from({ length: TableRows }, (_, i) => ({
      day: i + 1,
    }))
  );

  // Convert our cols structure to TanStack columns
  const columns = useMemo<ColumnDef<TableRow>[]>(() => {
    // Always include the day column
    const baseColumns: ColumnDef<TableRow>[] = [
      {
        accessorKey: "day",
        header: "יום",
        cell: (info) => info.getValue(),
      },
    ];

    // Add dynamic columns based on cols state
    const dynamicColumns = cols.map((col) => ({
      id: `col-${col.id}`,
      accessorKey: `col-${col.id}`,
      header: () => {
        switch (col.action) {
          case "missingTeacher":
            return { type: "select", color: "red", action: col.action, id: col.id };
          case "existingTeacher":
            return { type: "select", color: "yellow", action: col.action, id: col.id };
          case "info":
            return { type: "text", color: "green", title: "מידע מפוצל", action: col.action, id: col.id };
          default:
            return { type: "empty", action: col.action, id: col.id };
        }
      },
      cell: (info: any) => {
        const rowIndex = info.row.index;
        const cellData = col.cells[rowIndex];
        return {
          type: col.action,
          content: cellData?.content || "",
          rowIndex,
          colId: col.id,
        };
      },
    }));

    return [...baseColumns, ...dynamicColumns];
  }, [cols]);

  // Add a new column
  const addNewCol = (action: any) => {
    // const { thType, tdType } = editTableActions[action];
    const newColId = cols.length + 1;

    // Update the original cols structure for compatibility
    // setCols((prev) => [
    //   ...prev,
    //   {
    //     id: newColId,
    //     type: thType,
    //     action,
    //     cells: Array.from(
    //       { length: TableRows },
    //       () =>
    //         ({
    //           id: newColId,
    //           type: tdType,
    //           content: "test",
    //         }) as Cell,
    //     ),
    //   },
    // ]);

    // Update the data with the new column
    setData(prev => 
      prev.map((row, index) => ({
        ...row,
        [`col-${newColId}`]: "test"
      }))
    );
  };

  // Remove a column
  const removeCol = (id: number) => {
    setCols((prev) => prev.filter((col) => col.id !== id));
    
    // Update data to remove the column
    setData(prev => 
      prev.map(row => {
        const newRow = {...row};
        delete newRow[`col-${id}`];
        return newRow;
      })
    );
  };

  // Create the table instance
  const table = useReactTable({
    data,
    columns,
    state: {
      columnVisibility,
    },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
  });

  // Provide the table instance
  const getTable = () => table;

  const value: TableContextType = {
    cols,
    data,
    columns,
    columnVisibility,
    addNewCol,
    removeCol,
    getTable,
    scale,
    setScale,
  };

  return <TableContext.Provider value={value}>{children}</TableContext.Provider>;
};
