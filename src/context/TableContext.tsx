"use client";

import { TableRows } from "@/models/constant/table";
import { Cell, Col, TableAction } from "@/models/types/table";
import { editTableActions } from "@/resources/editTableActions";
import React, { createContext, useContext, useState, ReactNode } from "react";

interface TableContextType {
    cols: Col[];
    addNewCol: (action: TableAction) => void;
    removeCol: (id: number) => void;
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
    const [cols, setCols] = useState<Col[]>([]);

    const addNewCol = (action: TableAction) => {
        const { thType, tdType } = editTableActions[action];

        setCols((prev) => [
            ...prev,
            {
                id: prev.length + 1,
                type: thType,
                action,
                cells: Array.from(
                    { length: TableRows },
                    () =>
                        ({
                            id: prev.length + 1,
                            type: tdType,
                            content: "test",
                        }) as Cell,
                ),
            },
        ]);
    };

    const removeCol = (id: number) => {
        setCols((prev) => prev.filter((col) => col.id !== id));
    };

    const value: TableContextType = {
        cols,
        addNewCol,
        removeCol,
    };

    return <TableContext.Provider value={value}>{children}</TableContext.Provider>;
};
