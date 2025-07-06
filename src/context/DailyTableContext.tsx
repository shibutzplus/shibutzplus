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
import {
    createNewCellData,
    filterScheduleByDate,
    initCellData,
    setTeacherColumn,
} from "@/services/dailyScheduleService";
import { generateId } from "@/utils";
import useInitDailyData from "@/hooks/useInitDailyData";
import { addDailyCellAction } from "@/app/actions/addDailyCellAction";
import { useActions } from "./ActionsContext";

interface DailyTableContextType {
    data: TeacherRow[];
    tableColumns: ColumnDef<TeacherRow>[];
    dailySchedule: DailySchedule;
    selectedTeacherId?: string;
    addColumn: (colType: ActionColumnType) => void;
    removeColumn: () => void;
    clearTeacherColumn: (day: string, headerId: string) => void;
    populateTeacherColumn: (
        selectedDate: string,
        id: string,
        schoolId: string,
        dayNumber: number,
        teacherId: string,
    ) => Promise<boolean>;
    addNewSubTeacherCell: (
        hour: number,
        columnId: string,
        selectedDate: string,
        subTeacherId: string,
        type: ColumnType,
    ) => Promise<DailyScheduleType | undefined>;
}

// on first load I need to get all the data from DB into dailyScheduleData.
// in the popultion function Im checking the dailySchedule for the selected date, 
// if the column already exsits Im render the column
// if the column not exsits Im creating the column and render it
// only if create new column or update exsisting one I update the dailySchedule state


const DailyTableContext = createContext<DailyTableContextType | undefined>(undefined);

export const useDailyTableContext = () => {
    const context = useContext(DailyTableContext);
    if (!context) throw new Error("useDailyTableContext must be used within DailyTableProvider");
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

interface DailyTableProviderProps {
    children: ReactNode;
}

export const DailyTableProvider: React.FC<DailyTableProviderProps> = ({ children }) => {
    const { school, teachers } = useMainContext();
    const { selectedDate } = useActions();

    const [data] = useState<TeacherRow[]>(
        Array.from({ length: TableRows }, (_, i) => ({ hour: i + 1 })),
    );

    const [tableColumns, setActionCols] = useState<ColumnDef<TeacherRow>[]>([]);
    const [dailySchedule, setDailySchedule] = useState<DailySchedule>({});
    const [selectedTeacherId, setSelectedTeacherId] = useState<string | undefined>(undefined);

    const [dailyScheduleData, setDailyScheduleData] = useState<DailyScheduleType[] | undefined>(
        undefined,
    );

    useInitDailyData({
        dailyScheduleData,
        setDailyScheduleData,
    });

    useEffect(() => {
        if (school && teachers && dailyScheduleData && dailyScheduleData.length > 0) {
            populateDailyScheduleTable(dailyScheduleData);
        }
    }, [school, teachers, dailyScheduleData, selectedDate]);

    const addColumn = (colType: ActionColumnType) => {
        const columnId = `${colType}-${generateId()}`;
        const newCol = buildColumn(colType, columnId);
        setActionCols([...tableColumns, newCol]);
    };

    const removeColumn = () => {
        setActionCols(tableColumns.slice(1));
    };

    const populateDailyScheduleTable = async (dailyScheduleData: DailyScheduleType[]) => {
        try {
            // Group entries by day and header ID for batch processing
            const entriesByDayAndHeader: Record<string, Record<string, DailyScheduleCell[]>> = {};
            const newSchedule: DailySchedule = { ...dailySchedule };
            clearDailySchedule();

            const filteredData = filterScheduleByDate(dailyScheduleData, selectedDate);

            // Process each schedule entry for the selected date
            filteredData?.forEach((entry) => {
                const columnId = entry.columnId;

                // Initialize grouping structure if needed
                if (!entriesByDayAndHeader[selectedDate]) {
                    entriesByDayAndHeader[selectedDate] = {};
                }

                if (!entriesByDayAndHeader[selectedDate][columnId]) {
                    entriesByDayAndHeader[selectedDate][columnId] = [];
                }

                const cellData: DailyScheduleCell = initCellData(entry);
                entriesByDayAndHeader[selectedDate][columnId].push(cellData);

                let columnType: ColumnType = "info";
                if (entry.absentTeacher) {
                    columnType = "missingTeacher";
                } else if (entry.presentTeacher) {
                    columnType = "existingTeacher";
                }

                // Make sure the column exists in tableColumns if it doesn't already
                const columnExists = tableColumns.some((col) => col.id === columnId);
                if (!columnExists) {
                    const newCol = buildColumn(columnType as ActionColumnType, columnId);
                    setActionCols((prev) => [...prev, newCol]);
                }
            });

            // Use the service function to update the schedule for each date and header
            Object.entries(entriesByDayAndHeader).forEach(([date, headerEntries]) => {
                Object.entries(headerEntries).forEach(([columnId, cells]) => {
                    // Use the service function to set the teacher column data
                    setTeacherColumn(newSchedule, date, cells, columnId);
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
        selectedDate: string,
        columnId: string,
        schoolId: string,
        dayNumber: number,
        teacherId: string,
    ) => {
        try {
            // Clear any existing data for this column
            clearTeacherColumn(selectedDate, columnId);

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
                    selectedDate,
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

    const clearDailySchedule = () => {
        // Clear all existing data
        setDailySchedule({});
        setActionCols([]);
    };

    const addNewSubTeacherCell = async (
        hour: number,
        columnId: string,
        selectedDate: string,
        subTeacherId: string,
        type: ColumnType,
    ) => {
        const cell = hour && columnId && dailySchedule[selectedDate]?.[columnId]?.[String(hour)];
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

        const cellData: DailyScheduleRequest = createNewCellData(
            type,
            selectedDate,
            columnId,
            hour,
            school,
            classData,
            subjectData,
            subTeacherData,
            headerTeacherData,
        );

        const response = await addDailyCellAction(cellData);
        if (response.success && response.data) {
            setDailyScheduleData((prev) => {
                if (!response.data) return prev;
                const updatedSchedule = prev ? [...prev, response.data] : [response.data];
                return updatedSchedule;
            });
            return response.data;
        }
        return undefined;
    };

    return (
        <DailyTableContext.Provider
            value={{
                data,
                tableColumns,
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
        </DailyTableContext.Provider>
    );
};
