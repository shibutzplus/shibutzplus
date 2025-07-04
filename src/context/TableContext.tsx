"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect, useRef } from "react";
import { TeacherRow, ActionColumnType } from "@/models/types/table";
import { ColumnDef } from "@tanstack/react-table";
import { TableRows } from "@/models/constant/table";
import InfoCell from "@/components/table/InfoCell/InfoCell";
import InfoHeader from "@/components/table/InfoHeader/InfoHeader";
import {
    ColumnType,
    DailySchedule,
    DailyScheduleCell,
    DailyScheduleRequest,
    DailyScheduleType,
} from "@/models/types/dailySchedule";
import DailyTeacherCell from "@/components/table/DailyTeacherCell/DailyTeacherCell";
import DailyTeacherHeader from "@/components/table/DailyTeacherHeader/DailyTeacherHeader";
import { getTeacherScheduleByDayAction } from "@/app/actions/getTeacherScheduleByDayAction";
import { useMainContext } from "./MainContext";
import { getColumnDate } from "@/utils/time";
import { setTeacherColumn } from "@/services/dailyScheduleService";
import { generateId } from "@/utils";

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
        columnId: string,
        selectedDayId: string,
        subTeacherId: string,
        type: ColumnType,
    ) => Promise<DailyScheduleType | undefined>;
}

const TableContext = createContext<TableContextType | undefined>(undefined);

export const useTableContext = () => {
    const context = useContext(TableContext);
    if (!context) throw new Error("useTableContext must be used within TableProvider");
    return context;
};

function buildColumn(colType: ActionColumnType, columnId: string): ColumnDef<TeacherRow> {
    if (colType === "missingTeacher") {
        return {
            id: columnId,
            header: () => <DailyTeacherHeader columnId={columnId} type="missingTeacher" />,
            cell: (props) => <DailyTeacherCell cell={props} type="missingTeacher" />,
            meta: { bgColor: "#f9fcf1" },
        };
    }
    if (colType === "existingTeacher") {
        return {
            id: columnId,
            header: () => <DailyTeacherHeader columnId={columnId} type="existingTeacher" />,
            cell: (props) => <DailyTeacherCell cell={props} type="existingTeacher" />,
            meta: { bgColor: "#f1f6fc" },
        };
    }
    return {
        id: columnId,
        header: () => <InfoHeader />,
        cell: () => <InfoCell />,
        meta: { bgColor: "#f2fcf1" },
    };
}

interface TableProviderProps {
    children: ReactNode;
}

export const TableProvider: React.FC<TableProviderProps> = ({ children }) => {
    const { school, teachers, dailyScheduleData, addNewDailyScheduleCell } = useMainContext();

    const [data] = useState<TeacherRow[]>(
        Array.from({ length: TableRows }, (_, i) => ({ hour: i + 1 })),
    );

    const [actionCols, setActionCols] = useState<ColumnDef<TeacherRow>[]>([]);
    const [nextId, setNextId] = useState<number>(1);
    const [dailySchedule, setDailySchedule] = useState<DailySchedule>({});
    const [selectedTeacherId, setSelectedTeacherId] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (school && teachers && dailyScheduleData && dailyScheduleData.length > 0) {
            populateDailyScheduleTable(dailyScheduleData);
        }
    }, [school, teachers, dailyScheduleData]);

    const addColumn = (colType: ActionColumnType) => {
        const columnId = `${colType}-${generateId()}`;
        const newCol = buildColumn(colType, columnId);
        setActionCols([...actionCols, newCol]);
        setNextId(nextId + 1);
    };

    const removeColumn = () => {
        setActionCols(actionCols.slice(1));
    };

    const populateDailyScheduleTable = async (dailyScheduleData: DailyScheduleType[]) => {
        try {
            // Group entries by day and header ID for batch processing
            const entriesByDayAndHeader: Record<string, Record<string, DailyScheduleCell[]>> = {};
            const newSchedule: DailySchedule = { ...dailySchedule };

            // Process each schedule entry for the current week
            dailyScheduleData?.forEach((entry) => {
                const columnId = entry.columnId;
                const day = entry.day;

                // Clear any existing data for this column
                clearTeacherColumn(day, columnId);

                // Initialize grouping structure if needed
                if (!entriesByDayAndHeader[day]) {
                    entriesByDayAndHeader[day] = {};
                }

                if (!entriesByDayAndHeader[day][columnId]) {
                    entriesByDayAndHeader[day][columnId] = [];
                }

                // Create the cell data
                const cellData: DailyScheduleCell = {
                    hour: entry.hour,
                    class: entry.class,
                    subject: entry.subject,
                    event: entry.event,
                    subTeacher: entry.subTeacher
                };

                if (entry.absentTeacher) {
                    cellData.headerTeacher = entry.absentTeacher;
                } else if (entry.presentTeacher) {
                    cellData.headerTeacher = entry.presentTeacher;
                }

                // Add to the grouped data
                entriesByDayAndHeader[day][columnId].push(cellData);

                let columnType: ColumnType = "info";
                if (entry.absentTeacher) {
                    columnType = "missingTeacher";
                } else if (entry.presentTeacher) {
                    columnType = "existingTeacher";
                }

                // Make sure the column exists in actionCols if it doesn't already
                const columnExists = actionCols.some((col) => col.id === columnId);
                if (!columnExists) {
                    const newCol = buildColumn(columnType as ActionColumnType, columnId);
                    setActionCols((prev) => [...prev, newCol]);
                }
            });

            // Use the service function to update the schedule for each day and header
            Object.entries(entriesByDayAndHeader).forEach(([day, headerEntries]) => {
                Object.entries(headerEntries).forEach(([columnId, cells]) => {
                    // Use the service function to set the teacher column data
                    setTeacherColumn(newSchedule, day, cells, columnId);
                });
            });

            // Update the daily schedule state
            setDailySchedule(newSchedule);
            return true;
        } catch (error) {
            console.error("Error fetching daily schedule data:", error);
            return false;
        }
    };

    const populateTeacherColumn = async (
        selectedDayId: string,
        columnId: string,
        schoolId: string,
        dayNumber: number,
        teacherId: string,
    ) => {
        try {
            // Clear any existing data for this column
            clearTeacherColumn(selectedDayId, columnId);

            const response = await getTeacherScheduleByDayAction(schoolId, dayNumber, teacherId);
            if (response.success && response.data) {
                const scheduleData = response.data.map(
                    (item) =>
                        ({
                            hour: item.hour,
                            class: item.class,
                            subject: item.subject,
                        }) as DailyScheduleCell,
                );

                // Update the context with the teacher's schedule
                const updatedSchedule = setTeacherColumn(
                    { ...dailySchedule },
                    selectedDayId,
                    scheduleData,
                    columnId,
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

    const clearTeacherColumn = (day: string, columnId: string) => {
        const updatedSchedule = { ...dailySchedule };

        // Check if the day and header exist before trying to clear
        if (updatedSchedule[day] && updatedSchedule[day][columnId]) {
            // Clear all schedule data for this header on this day
            updatedSchedule[day][columnId] = {};
        }

        setDailySchedule(updatedSchedule);
    };

    const addNewSubTeacherCell = async (
        hour: number,
        columnId: string,
        selectedDayId: string,
        subTeacherId: string,
        type: ColumnType,
    ) => {
        const cell = hour && columnId && dailySchedule[selectedDayId]?.[columnId]?.[String(hour)];
        if (!cell) return;

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
            return;
        }

        const cellData: DailyScheduleRequest = {
            date: getColumnDate(Number(selectedDayId)),
            day: selectedDayId,
            columnId: columnId,
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
        const response = await addNewDailyScheduleCell(cellData);
        return response;
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
