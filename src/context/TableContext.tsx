"use client";

import React, { createContext, useReducer, useContext, ReactNode } from "react";
import { TeacherRow, ActionColumnType } from "@/models/types/table";
import { ColumnDef } from "@tanstack/react-table";
import { TableRows } from "@/models/constant/table";
import MissingTeacherHeader from "@/components/table/MissingTeacherHeader/MissingTeacherHeader";
import MissingTeacherCell from "@/components/table/MissingTeacherCell/MissingTeacherCell";
import ExistingTeacherHeader from "@/components/table/ExistingTeacherHeader/ExistingTeacherHeader";
import ExistingTeacherCell from "@/components/table/ExistingTeacherCell/ExistingTeacherCell";
import InfoCell from "@/components/table/InfoCell/InfoCell";
import InfoHeader from "@/components/table/InfoHeader/InfoHeader";
import { DailySchedule } from "@/models/types/dailySchedule";
import { todayDateFormat } from "@/utils/time";

interface State {
    data: TeacherRow[];
    actionCols: ColumnDef<TeacherRow>[];
    nextId: number;
    dailySchedule: DailySchedule;
    selectedTeacherId?: string;
    currentDay: string;
}

type Action =
    | { type: "ADD_COL"; colType: ActionColumnType }
    | { type: "REMOVE_COL" }
    | {
          type: "SET_TEACHER_SCHEDULE";
          day: string;
          headerId: string;
          schedule: { hour: number; classId: string; subjectId: string }[];
      }
    | { type: "CLEAR_TEACHER_SCHEDULE"; day: string; headerId: string }
    | { type: "SET_SELECTED_TEACHER"; teacherId: string };

const initialState: State = {
    data: Array.from({ length: TableRows }, (_, i) => ({ hour: i + 1 })),
    actionCols: [],
    nextId: 1,
    dailySchedule: {},
    currentDay: todayDateFormat()
};

const TableContext = createContext<{
    state: State;
    dispatch: React.Dispatch<Action>;
} | null>(null);

function buildColumn(colType: ActionColumnType, id: string): ColumnDef<TeacherRow> {
    if (colType === "missingTeacher") {
        return {
            id,
            header: () => <MissingTeacherHeader />,
            cell: () => <MissingTeacherCell />,
            meta: { bgColor: "#f3e5f5" },
        };
    }
    if (colType === "existingTeacher") {
        return {
            id,
            header: () => <ExistingTeacherHeader id={id} />,
            cell: (props) => <ExistingTeacherCell cell={props} />,
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
        case "SET_TEACHER_SCHEDULE": {
            const { day, headerId, schedule } = action;
            const updatedSchedule = { ...state.dailySchedule };

            // Initialize day if it doesn't exist
            if (!updatedSchedule[day]) {
                updatedSchedule[day] = {};
            }

            // Initialize header if it doesn't exist
            if (!updatedSchedule[day][headerId]) {
                updatedSchedule[day][headerId] = {};
            }

            // Add schedule entries for each hour
            schedule.forEach((item) => {
                updatedSchedule[day][headerId][`${item.hour}`] = {
                    classId: item.classId,
                    subjectId: item.subjectId,
                };
            });

            return {
                ...state,
                dailySchedule: updatedSchedule,
            };
        }
        case "CLEAR_TEACHER_SCHEDULE": {
            const { day, headerId } = action;
            const updatedSchedule = { ...state.dailySchedule };
            
            // Check if the day and header exist before trying to clear
            if (updatedSchedule[day] && updatedSchedule[day][headerId]) {
                // Clear all schedule data for this header on this day
                updatedSchedule[day][headerId] = {};
            }
            
            return {
                ...state,
                dailySchedule: updatedSchedule,
            };
        }
        case "SET_SELECTED_TEACHER": {
            return {
                ...state,
                selectedTeacherId: action.teacherId,
            };
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
