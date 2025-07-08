"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
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
    TeacherHourlyScheduleItem,
} from "@/models/types/dailySchedule";
import DailyTeacherCell from "@/components/table/DailyTeacherCell/DailyTeacherCell";
import DailyTeacherHeader from "@/components/table/DailyTeacherHeader/DailyTeacherHeader";
import { getTeacherScheduleByDayAction } from "@/app/actions/getTeacherScheduleByDayAction";
import { useMainContext } from "./MainContext";
import {
    columnExistsForDate,
    createNewCellData,
    filterScheduleByDate,
    groupScheduleEntriesByDateAndCol,
    setEmptyTeacherColumn,
    setTeacherColumn,
} from "@/services/dailyScheduleService";
import { generateId } from "@/utils";
import useInitDailyData from "@/hooks/useInitDailyData";
import { addDailyCellAction } from "@/app/actions/addDailyCellAction";
import { deleteDailyColumnAction } from "@/app/actions/deleteDailyColumnAction";
import { useTopNav } from "./TopNavContext";
import { TeacherType } from "@/models/types/teachers";

interface DailyTableContextType {
    data: TeacherRow[];
    tableColumns: ColumnDef<TeacherRow>[];
    dailySchedule: DailySchedule;
    addNewColumn: (colType: ActionColumnType) => void;
    deleteTeacherColumn: (columnId: string) => Promise<boolean>;
    clearTeacherColumn: (day: string, headerId: string) => Promise<void>;
    populateTeacherColumn: (
        id: string,
        dayNumber: number,
        teacherId: string,
    ) => Promise<TeacherHourlyScheduleItem[] | undefined>;
    addNewSubTeacherCell: (
        cellData: DailyScheduleCell,
        columnId: string,
        selectedDate: string,
        subTeacherData: TeacherType,
        type: ColumnType,
    ) => Promise<DailyScheduleType | undefined>;
}

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
    const { selectedDate } = useTopNav();

    const [data] = useState<TeacherRow[]>(
        Array.from({ length: TableRows }, (_, i) => ({ hour: i + 1 })),
    );

    const [tableColumns, setActionCols] = useState<ColumnDef<TeacherRow>[]>([]);
    const [dailySchedule, setDailySchedule] = useState<DailySchedule>({});

    const [dailyScheduleRawData, setDailyScheduleRawData] = useState<
        DailyScheduleType[] | undefined
    >(undefined);

    useInitDailyData({
        dailyScheduleRawData,
        setDailyScheduleRawData,
    });

    useEffect(() => {
        if (school && teachers && dailyScheduleRawData && dailyScheduleRawData.length > 0) {
            populateDailyScheduleTable(dailyScheduleRawData);
        }
    }, [school, teachers, dailyScheduleRawData, selectedDate]);

    const addNewColumn = (colType: ActionColumnType) => {
        const columnId = `${colType}-${generateId()}`;
        const newCol = buildColumn(colType, columnId);
        setActionCols([...tableColumns, newCol]);
    };

    const deleteTeacherColumn = async (columnId: string) => {
        if (!school?.id) return false;
        const filteredCols = tableColumns.filter((col) => col.id !== columnId);
        if (filteredCols.length === 0 || filteredCols.length === tableColumns.length) return false;

        // Update UI immediately
        setActionCols(filteredCols);
        setDailySchedule((prev) => {
            const updatedSchedule = { ...prev };
            delete updatedSchedule[columnId];
            return updatedSchedule;
        });

        try {
            const response = await deleteDailyColumnAction(school.id, columnId);
            if (response.success && response.dailySchedules) {
                setDailyScheduleRawData(response.dailySchedules);
                return true;
            }
        } catch (error) {
            console.error("Error deleting daily column:", error);
        }
        return false;
    };

    const populateDailyScheduleTable = async (dailyScheduleRawData: DailyScheduleType[]) => {
        try {
            const filteredData = filterScheduleByDate(dailyScheduleRawData, selectedDate);

            if (!filteredData || filteredData.length === 0) {
                clearDailySchedule();
                return true;
            }

            const entriesByDayAndHeader = groupScheduleEntriesByDateAndCol(
                filteredData,
                selectedDate,
            );

            // Track columns that need to be created or updated
            const newColumns: { id: string; type: ActionColumnType }[] = [];
            const columnsToUpdate = new Set<string>();

            filteredData.forEach((entry) => {
                const columnId = entry.columnId;

                let columnType: ColumnType = "info";
                if (entry.absentTeacher) {
                    columnType = "missingTeacher";
                } else if (entry.presentTeacher) {
                    columnType = "existingTeacher";
                }

                // Check if column exists in the UI
                const columnExists = tableColumns.some((col) => col.id === columnId);

                const columnHasData = columnExistsForDate(dailySchedule, selectedDate, columnId);

                // If column doesn't exist in UI, create it
                if (!columnExists) {
                    newColumns.push({
                        id: columnId,
                        type: columnType as ActionColumnType,
                    });
                }

                // If column data needs updating, mark it for update
                if (!columnHasData) {
                    columnsToUpdate.add(columnId);
                }
            });

            // Only create new columns if needed
            if (newColumns.length > 0) {
                const newColumnDefs = newColumns.map((col) => buildColumn(col.type, col.id));

                setActionCols((prev) => [...prev, ...newColumnDefs]);
            }

            // Only update schedule data if needed
            if (columnsToUpdate.size > 0) {
                const newSchedule: DailySchedule = { ...dailySchedule };

                Object.entries(entriesByDayAndHeader).forEach(([date, headerEntries]) => {
                    Object.entries(headerEntries).forEach(([columnId, cells]) => {
                        if (columnsToUpdate.has(columnId)) {
                            setTeacherColumn(newSchedule, date, cells, columnId);
                        }
                    });
                });
                setDailySchedule(newSchedule);
            }

            return true;
        } catch (error) {
            console.error("Error processing daily schedule data:", error);
            return false;
        }
    };

    const populateTeacherColumn = async (
        columnId: string,
        dayNumber: number,
        teacherId: string,
    ) => {
        const schoolId = school?.id;
        if (!schoolId) return;
        try {
            // Clear any existing data for this column
            await clearTeacherColumn(selectedDate, columnId);

            const response = await getTeacherScheduleByDayAction(schoolId, dayNumber, teacherId);
            if (response.success && response.data) {
                let updatedSchedule: DailySchedule;
                if (response.data.length > 0) {
                    const scheduleData = response.data.map(
                        (item) =>
                            ({
                                hour: item.hour,
                                class: item.class,
                                subject: item.subject,
                                headerTeacher: item.headerTeacher,
                            }) as DailyScheduleCell,
                    );

                    // Update the context with the teacher's schedule
                    updatedSchedule = setTeacherColumn(
                        { ...dailySchedule },
                        selectedDate,
                        scheduleData,
                        columnId,
                    );
                } else {
                    const headerTeacher = teachers?.find((t) => t.id === teacherId);
                    if (!headerTeacher) return;

                    updatedSchedule = setEmptyTeacherColumn(
                        { ...dailySchedule },
                        selectedDate,
                        headerTeacher,
                        columnId,
                    );
                }
                setDailySchedule(updatedSchedule);
                return response.data;
            }
            return undefined;
        } catch (error) {
            console.error("Error fetching teacher schedule:", error);
            return undefined;
        }
    };

    const addNewSubTeacherCell = async (
        cellData: DailyScheduleCell,
        columnId: string,
        selectedDate: string,
        subTeacher: TeacherType,
        type: ColumnType,
    ) => {
        const { hour, class: classData, subject, headerTeacher } = cellData;
        if (!school || !classData || !subject || !subTeacher || !headerTeacher) {
            return;
        }

        const dailyCellData: DailyScheduleRequest = createNewCellData(
            type,
            selectedDate,
            columnId,
            hour,
            school,
            classData,
            subject,
            subTeacher,
            headerTeacher,
        );

        const response = await addDailyCellAction(dailyCellData);
        if (response.success && response.data) {
            setDailyScheduleRawData((prev) => {
                if (!response.data) return prev;
                const updatedSchedule = prev ? [...prev, response.data] : [response.data];
                return updatedSchedule;
            });
            return response.data;
        }
        return undefined;
    };

    const clearTeacherColumn = async (day: string, columnId: string) => {
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

    return (
        <DailyTableContext.Provider
            value={{
                data,
                tableColumns,
                dailySchedule,
                addNewColumn,
                deleteTeacherColumn,
                clearTeacherColumn,
                populateTeacherColumn,
                addNewSubTeacherCell,
            }}
        >
            {children}
        </DailyTableContext.Provider>
    );
};
