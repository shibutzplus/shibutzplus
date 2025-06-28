"use client";

import React, { createContext, useReducer, useContext, ReactNode } from "react";
import { TeacherRow, ActionColumnType } from "@/models/types/table";
import { ColumnDef } from "@tanstack/react-table";
import ExistingTeacherCell from "@/components/ExistingTeacherCell/ExistingTeacherCell";
import InfoCell from "@/components/InfoCell/InfoCell";
import ExistingTeacherHeader from "@/components/ExistingTeacherHeader/ExistingTeacherHeader";
import InfoHeader from "@/components/InfoHeader/InfoHeader";

interface State {
    data: TeacherRow[];
    actionCols: ColumnDef<TeacherRow>[];
    nextId: number;
}

type Action = { type: "ADD_COL"; colType: ActionColumnType } | { type: "REMOVE_COL" };

const initialState: State = {
    data: Array.from({ length: 8 }, (_, i) => ({ hour: i + 1 })),
    actionCols: [],
    nextId: 1,
};

const TableContext = createContext<{
    state: State;
    dispatch: React.Dispatch<Action>;
} | null>(null);

function buildColumn(colType: ActionColumnType, id: string): ColumnDef<TeacherRow> {
    if (colType === "missingTeacher") {
        return {
            id,
            header: () => <ExistingTeacherHeader />,
            cell: () => <ExistingTeacherCell />,
            meta: { bgColor: "#f3e5f5" },
        };
    }
    if (colType === "existingTeacher") {
        return {
            id,
            header: () => <ExistingTeacherHeader />,
            cell: () => <ExistingTeacherCell />,
            meta: { bgColor: "#fff3e0" },
        };
    }
    return {
        id,
        header: () => <InfoHeader />,
        cell: () => <InfoCell />,
        meta: { bgColor: "#e8f5e9" },
    };
}

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case "ADD_COL": {
            const id = `${action.colType}-${state.nextId}`;
            const newCol = buildColumn(action.colType, id);
            return {
                ...state,
                actionCols: [...state.actionCols, newCol],
                nextId: state.nextId + 1,
            };
        }
        case "REMOVE_COL": {
            return { ...state, actionCols: state.actionCols.slice(1) };
        }
        default:
            return state;
    }
}

export const TableProvider = ({ children }: { children: ReactNode }) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    return <TableContext.Provider value={{ state, dispatch }}>{children}</TableContext.Provider>;
};

export const useTable = () => {
    const ctx = useContext(TableContext);
    if (!ctx) throw new Error("useTable must be used within TableProvider");
    return ctx;
};
