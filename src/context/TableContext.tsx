"use client";

import React, { createContext, useState, useContext, ReactNode } from "react";
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

interface TableContextType {
    data: TeacherRow[];
    actionCols: ColumnDef<TeacherRow>[];
    nextId: number;
    dailySchedule: DailySchedule;
    selectedTeacherId?: string;
    currentDay: string;
    addColumn: (colType: ActionColumnType) => void;
    removeColumn: () => void;
    setTeacherSchedule: (day: string, headerId: string, schedule: { hour: number; classId: string; subjectId: string }[]) => void;
    clearTeacherSchedule: (day: string, headerId: string) => void;
    setSelectedTeacher: (teacherId: string) => void;
}

const TableContext = createContext<TableContextType | undefined>(undefined);

export const useTable = () => {
    const context = useContext(TableContext);
    if (!context) throw new Error("useTable must be used within TableProvider");
    return context;
};

function buildColumn(colType: ActionColumnType, id: string): ColumnDef<TeacherRow> {
    if (colType === "missingTeacher") {
        return {
            id,
            header: () => <MissingTeacherHeader id={id} />,
            cell: (props) => <MissingTeacherCell cell={props} />,
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

interface TableProviderProps {
    children: ReactNode;
}

export const TableProvider: React.FC<TableProviderProps> = ({ children }) => {
    const [data] = useState<TeacherRow[]>(Array.from({ length: TableRows }, (_, i) => ({ hour: i + 1 })));
    const [actionCols, setActionCols] = useState<ColumnDef<TeacherRow>[]>([]);
    const [nextId, setNextId] = useState<number>(1);
    const [dailySchedule, setDailySchedule] = useState<DailySchedule>({});
    const [selectedTeacherId, setSelectedTeacherId] = useState<string | undefined>(undefined);
    const [currentDay] = useState<string>(todayDateFormat());

    const addColumn = (colType: ActionColumnType) => {
        const id = `${colType}-${nextId}`;
        const newCol = buildColumn(colType, id);
        setActionCols([...actionCols, newCol]);
        setNextId(nextId + 1);
    };

    const removeColumn = () => {
        setActionCols(actionCols.slice(1));
    };

    const setTeacherSchedule = (day: string, headerId: string, schedule: { hour: number; classId: string; subjectId: string }[]) => {
        const updatedSchedule = { ...dailySchedule };

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

        setDailySchedule(updatedSchedule);
    };

    const clearTeacherSchedule = (day: string, headerId: string) => {
        const updatedSchedule = { ...dailySchedule };
        
        // Check if the day and header exist before trying to clear
        if (updatedSchedule[day] && updatedSchedule[day][headerId]) {
            // Clear all schedule data for this header on this day
            updatedSchedule[day][headerId] = {};
        }
        
        setDailySchedule(updatedSchedule);
    };

    return (
        <TableContext.Provider
            value={{
                data,
                actionCols,
                nextId,
                dailySchedule,
                selectedTeacherId,
                currentDay,
                addColumn,
                removeColumn,
                setTeacherSchedule,
                clearTeacherSchedule,
                setSelectedTeacher: setSelectedTeacherId,
            }}
        >
            {children}
        </TableContext.Provider>
    );
};
