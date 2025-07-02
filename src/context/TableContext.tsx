"use client";

import React, { createContext, useState, useContext, ReactNode } from "react";
import { TeacherRow, ActionColumnType } from "@/models/types/table";
import { ColumnDef } from "@tanstack/react-table";
import { TableRows } from "@/models/constant/table";
import InfoCell from "@/components/table/InfoCell/InfoCell";
import InfoHeader from "@/components/table/InfoHeader/InfoHeader";
import { ColumnType, DailySchedule, DailyScheduleRequest } from "@/models/types/dailySchedule";
import DailyTeacherCell from "@/components/table/DailyTeacherCell/DailyTeacherCell";
import DailyTeacherHeader from "@/components/table/DailyTeacherHeader/DailyTeacherHeader";
import { getTeacherScheduleByDayAction } from "@/app/actions/getTeacherScheduleByDayAction";
import { TeacherType } from "@/models/types/teachers";
import { addDailyCellAction } from "@/app/actions/addDailyCellAction";
import { useMainContext } from "./MainContext";
import { getDateString } from "@/utils/time";

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
    const { school, classes, subjects, teachers } = useMainContext();

    const [data] = useState<TeacherRow[]>(
        Array.from({ length: TableRows }, (_, i) => ({ hour: i + 1 })),
    );
    const [actionCols, setActionCols] = useState<ColumnDef<TeacherRow>[]>([]);
    const [nextId, setNextId] = useState<number>(1);
    const [dailySchedule, setDailySchedule] = useState<DailySchedule>({});
    const [selectedTeacherId, setSelectedTeacherId] = useState<string | undefined>(undefined);

    const populateTable = () => {};

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
                    classId: item.class.id,
                    subjectId: item.subject.id,
                }));

                // Update the context with the teacher's schedule
                setTeacherColumn(selectedDayId, id, scheduleData);
                setSelectedTeacherId(teacherId);
                return true;
            }
            return false;
        } catch (error) {
            console.error("Error fetching teacher schedule:", error);
            return false;
        }
    };

    const setTeacherColumn = (
        day: string,
        headerId: string,
        columnData: { hour: number; classId: string; subjectId: string }[],
    ) => {
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
        columnData.forEach((row) => {
            updatedSchedule[day][headerId][`${row.hour}`] = {
                classId: row.classId,
                subjectId: row.subjectId,
            };
        });

        setDailySchedule(updatedSchedule);
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

        const classData = classes?.find((c) => c.id === cell.classId);
        const subjectData = subjects?.find((s) => s.id === cell.subjectId);
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
            date: getDateString(Number(selectedDayId)),
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
        return response.success ? true : false;
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
