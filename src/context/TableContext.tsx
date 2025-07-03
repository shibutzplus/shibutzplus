"use client";

import React, { createContext, useState, useContext, ReactNode } from "react";
import { TeacherRow, ActionColumnType } from "@/models/types/table";
import { ColumnDef } from "@tanstack/react-table";
import { TableRows } from "@/models/constant/table";
import InfoCell from "@/components/table/InfoCell/InfoCell";
import InfoHeader from "@/components/table/InfoHeader/InfoHeader";
import { ColumnType, DailySchedule, DailyScheduleCell, DailyScheduleRequest } from "@/models/types/dailySchedule";
import DailyTeacherCell from "@/components/table/DailyTeacherCell/DailyTeacherCell";
import DailyTeacherHeader from "@/components/table/DailyTeacherHeader/DailyTeacherHeader";
import { getTeacherScheduleByDayAction } from "@/app/actions/getTeacherScheduleByDayAction";
import { addDailyCellAction } from "@/app/actions/addDailyCellAction";
import { useMainContext } from "./MainContext";
import { getColumnDate } from "@/utils/time";
import { setTeacherColumn } from "@/services/dailyScheduleService";

interface TableContextType {
    data: TeacherRow[];
    actionCols: ColumnDef<TeacherRow>[];
    nextId: number;
    dailySchedule: DailySchedule;
    selectedTeacherId?: string;
    addColumn: (colType: ActionColumnType) => void;
    removeColumn: () => void;
    clearTeacherColumn: (day: string, headerId: string) => void;
    populateTeacherColumn: (
        selectedDayId: string,
        id: string,
        schoolId: string,
        dayNumber: number,
        teacherId: string,
    ) => Promise<boolean>;
    addNewSubTeacherCell: (
        hour: number,
        headerId: string,
        selectedDayId: string,
        subTeacherId: string,
        type: ColumnType,
    ) => Promise<boolean>;
}

const TableContext = createContext<TableContextType | undefined>(undefined);

export const useTableContext = () => {
    const context = useContext(TableContext);
    if (!context) throw new Error("useTableContext must be used within TableProvider");
    return context;
};

function buildColumn(colType: ActionColumnType, id: string): ColumnDef<TeacherRow> {
    if (colType === "missingTeacher") {
        return {
            id,
            header: () => <DailyTeacherHeader id={id} type="missingTeacher" />,
            cell: (props) => <DailyTeacherCell cell={props} type="missingTeacher" />,
            meta: { bgColor: "#f9fcf1" },
        };
    }
    if (colType === "existingTeacher") {
        return {
            id,
            header: () => <DailyTeacherHeader id={id} type="existingTeacher" />,
            cell: (props) => <DailyTeacherCell cell={props} type="existingTeacher" />,
            meta: { bgColor: "#f1f6fc" },
        };
    }
    return {
        id,
        header: () => <InfoHeader />,
        cell: () => <InfoCell />,
        meta: { bgColor: "#f2fcf1" },
    };
}

interface TableProviderProps {
    children: ReactNode;
}

export const TableProvider: React.FC<TableProviderProps> = ({ children }) => {
    const { school, teachers } = useMainContext();

    const [data] = useState<TeacherRow[]>(
        Array.from({ length: TableRows }, (_, i) => ({ hour: i + 1 })),
    );
    const [actionCols, setActionCols] = useState<ColumnDef<TeacherRow>[]>([]);
    const [nextId, setNextId] = useState<number>(1);
    const [dailySchedule, setDailySchedule] = useState<DailySchedule>({});
    const [selectedTeacherId, setSelectedTeacherId] = useState<string | undefined>(undefined);

    const addColumn = (colType: ActionColumnType) => {
        const id = `${colType}-${nextId}`;
        const newCol = buildColumn(colType, id);
        setActionCols([...actionCols, newCol]);
        setNextId(nextId + 1);
    };

    const removeColumn = () => {
        setActionCols(actionCols.slice(1));
    };

    const populateTeacherColumn = async (
        selectedDayId: string,
        id: string,
        schoolId: string,
        dayNumber: number,
        teacherId: string,
    ) => {
        try {
            // Clear any existing data for this column
            clearTeacherColumn(selectedDayId, id);

            const response = await getTeacherScheduleByDayAction(schoolId, dayNumber, teacherId);
            if (response.success && response.data) {
                const scheduleData = response.data.map((item) => ({
                    hour: item.hour,
                    class: item.class,
                    subject: item.subject,
                } as DailyScheduleCell));

                // Update the context with the teacher's schedule
                const updatedSchedule = setTeacherColumn(
                    { ...dailySchedule },
                    selectedDayId,
                    scheduleData,
                    id,
                );
                setDailySchedule(updatedSchedule);
                setSelectedTeacherId(teacherId);
                return true;
            }
            return false;
        } catch (error) {
            console.error("Error fetching teacher schedule:", error);
            return false;
        }
    };

    const clearTeacherColumn = (day: string, headerId: string) => {
        const updatedSchedule = { ...dailySchedule };

        // Check if the day and header exist before trying to clear
        if (updatedSchedule[day] && updatedSchedule[day][headerId]) {
            // Clear all schedule data for this header on this day
            updatedSchedule[day][headerId] = {};
        }

        setDailySchedule(updatedSchedule);
    };

    const addNewSubTeacherCell = async (
        hour: number,
        headerId: string,
        selectedDayId: string,
        subTeacherId: string,
        type: ColumnType,
    ) => {
        const cell = hour && headerId && dailySchedule[selectedDayId]?.[headerId]?.[String(hour)];
        if (!cell) return false;

        const classData = cell.class;
        const subjectData = cell.subject;
        const subTeacherData = teachers?.find((t) => t.id === subTeacherId);
        const headerTeacherData = teachers?.find((t) => t.id === selectedTeacherId);

        if (
            !hour ||
            !school ||
            !classData ||
            !subjectData ||
            !subTeacherData ||
            !headerTeacherData
        ) {
            return false;
        }

        const cellData: DailyScheduleRequest = {
            date: getColumnDate(Number(selectedDayId)),
            day: selectedDayId,
            hour: hour,
            school: school,
            class: classData,
            subject: subjectData,
            subTeacher: subTeacherData,
        };

        // Set the appropriate teacher fields based on column type
        if (type === "existingTeacher") {
            cellData.presentTeacher = headerTeacherData;
        } else if (type === "missingTeacher") {
            cellData.absentTeacher = headerTeacherData;
        }
        const response = await addDailyCellAction(cellData);

        if (response.success) {
            return true;
        }

        return false;
    };

    return (
        <TableContext.Provider
            value={{
                data,
                actionCols,
                nextId,
                dailySchedule,
                selectedTeacherId,
                addColumn,
                removeColumn,
                clearTeacherColumn,
                populateTeacherColumn,
                addNewSubTeacherCell,
            }}
        >
            {children}
        </TableContext.Provider>
    );
};
