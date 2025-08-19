"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { TeacherRow, ActionColumnType } from "@/models/types/table";
import { ColumnDef } from "@tanstack/react-table";
import {
    ColumnType,
    DailySchedule,
    DailyScheduleCell,
    DailyScheduleType,
    TeacherHourlyScheduleItem,
} from "@/models/types/dailySchedule";
import DailyTeacherCell from "@/components/table/DailyTeacherCell/DailyTeacherCell";
import DailyTeacherHeader from "@/components/table/DailyTeacherHeader/DailyTeacherHeader";
import { getTeacherScheduleByDayAction } from "@/app/actions/GET/getTeacherScheduleByDayAction";
import { getDailyEmptyCellsAction } from "@/app/actions/GET/getDailyEmptyCellsAction";
import { useMainContext } from "./MainContext";
import {
    addNewEventCell,
    addNewSubTeacherCell,
    initEventCellData,
    initTeacherCellData,
    setEmptyTeacherColumn,
    setTeacherColumn,
    setEmptyEventColumn,
    setColumn,
    addTeacherToExistingCells,
} from "@/services/dailyScheduleService";
import { generateId } from "@/utils";
import { deleteDailyColumnAction } from "@/app/actions/DELETE/deleteDailyColumnAction";
import { useTopNav } from "./TopNavContext";
import { TeacherType } from "@/models/types/teachers";
import { getDayNumberByDateString, getTodayDateString } from "@/utils/time";
import { updateDailyTeacherCellAction } from "@/app/actions/PUT/updateDailyTeacherCellAction";
import EventHeader from "@/components/table/EventHeader/EventHeader";
import EventCell from "@/components/table/EventCell/EventCell";
import { addDailyTeacherCellAction } from "@/app/actions/POST/addDailyTeacherCellAction";
import { addDailyEventCellAction } from "@/app/actions/POST/addDailyEventCellAction";
import { updateDailyEventCellAction } from "@/app/actions/PUT/updateDailyEventCellAction";
import { getDailyScheduleAction } from "@/app/actions/GET/getDailyScheduleAction";

interface DailyTableContextType {
    tableColumns: ColumnDef<TeacherRow>[];
    dailySchedule: DailySchedule;
    dailyScheduleRawData: DailyScheduleType[] | undefined;
    isLoading: boolean;
    addNewColumn: (colType: ActionColumnType) => void;
    deleteColumn: (columnId: string) => Promise<boolean>;
    populateTeacherColumn: (
        id: string,
        dayNumber: number,
        teacherId: string,
    ) => Promise<TeacherHourlyScheduleItem[] | undefined>;
    populateEventColumn: (columnId: string, eventTitle: string) => void;
    addNewCell: (
        type: ColumnType,
        cellData: DailyScheduleCell,
        columnId: string,
        selectedDate: string,
        data: { event?: string; subTeacher?: TeacherType },
    ) => Promise<DailyScheduleType | undefined>;
    updateCell: (
        type: ColumnType,
        cellData: DailyScheduleCell,
        columnId: string,
        selectedDate: string,
        dailyScheduleId: string,
        data: { event?: string; subTeacher?: TeacherType },
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
        header: () => <EventHeader columnId={columnId} />,
        cell: (props) => <EventCell cell={props} />,
        meta: { bgColor: "#f2fcf1" },
    };
}

interface DailyTableProviderProps {
    children: ReactNode;
}

export const DailyTableProvider: React.FC<DailyTableProviderProps> = ({ children }) => {
    const { school, teachers } = useMainContext();
    const { selectedDate } = useTopNav();

    const [tableColumns, setActionCols] = useState<ColumnDef<TeacherRow>[]>([]);
    const [dailySchedule, setDailySchedule] = useState<DailySchedule>({});
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [dailyScheduleRawData, setDailyScheduleRawData] = useState<
        DailyScheduleType[] | undefined
    >(undefined);

    useEffect(() => {
        const fetchDataForDate = async () => {
            if (!school?.id || !selectedDate) return;

            setIsLoading(true);
            try {
                const targetDate = selectedDate || getTodayDateString();
                const response = await getDailyScheduleAction(school.id, targetDate);

                if (response.success && response.data) {
                    setDailyScheduleRawData(response.data);
                } else {
                    console.error("Failed to fetch daily schedule:", response.message);
                    setDailyScheduleRawData([]);
                }
            } catch (error) {
                console.error("Error fetching daily schedule data:", error);
                setDailyScheduleRawData([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDataForDate();
    }, [school?.id, selectedDate]);

    useEffect(() => {
        // Populate table when data is available
        if (school && teachers && dailyScheduleRawData && dailyScheduleRawData.length > 0) {
            populateDailyScheduleTable(dailyScheduleRawData);
        } else if (dailyScheduleRawData && dailyScheduleRawData.length === 0) {
            // Clear table if no data for selected date
            clearDailySchedule();
        }
    }, [school, teachers, dailyScheduleRawData, selectedDate]);


    const populateDailyScheduleTable = async (dailySchedulColumns: DailyScheduleType[]) => {
        try {
            clearDailySchedule();
            if (!dailySchedulColumns || dailySchedulColumns.length === 0) return;

            const entriesByDayAndHeader: Record<string, Record<string, DailyScheduleCell[]>> = {};
            const columnsToCreate: { id: string; type: ActionColumnType }[] = [];
            const seenColumnIds = new Set<string>();
            let existingCells: { teacherId: string; hours: number[] }[] = [];

            for (const columnCell of dailySchedulColumns) {
                const columnId = columnCell.columnId;

                const { absentTeacher, presentTeacher, event, hour } = columnCell;

                let cellData: DailyScheduleCell;
                let columnType: ColumnType = "event";
                if (event) {
                    columnType = "event";
                    cellData = initEventCellData(columnCell);
                } else {
                    if (absentTeacher) {
                        columnType = "missingTeacher";
                        addTeacherToExistingCells(existingCells, absentTeacher.id, hour);
                    } else if (presentTeacher) {
                        columnType = "existingTeacher";
                        addTeacherToExistingCells(existingCells, presentTeacher.id, hour);
                    }
                    cellData = initTeacherCellData(columnCell);
                }

                // If the column is not already in the columnsToCreate array, add it
                if (!seenColumnIds.has(columnId)) {
                    columnsToCreate.push({
                        id: columnId,
                        type: columnType as ActionColumnType,
                    });
                    seenColumnIds.add(columnId);
                }

                if (!entriesByDayAndHeader[selectedDate]) {
                    entriesByDayAndHeader[selectedDate] = {};
                }
                if (!entriesByDayAndHeader[selectedDate][columnId]) {
                    entriesByDayAndHeader[selectedDate][columnId] = [];
                }

                entriesByDayAndHeader[selectedDate][columnId].push(cellData);
            }

            if (existingCells.length > 0 && school) {
                const day = getDayNumberByDateString(selectedDate);
                const response = await getDailyEmptyCellsAction(school.id, day, existingCells);
                if (response.success && response.data && response.data.length > 0) {
                    response.data.forEach((cellData) => {
                        const columnid = dailySchedulColumns.find(
                            (col) =>
                                col.absentTeacher?.id === cellData.headerCol?.headerTeacher?.id ||
                                col.presentTeacher?.id === cellData.headerCol?.headerTeacher?.id,
                        )?.columnId;
                        if (columnid) {
                            entriesByDayAndHeader[selectedDate][columnid].push(cellData);
                        }
                    });
                }
            }

            // Add new columns to the table
            if (columnsToCreate.length > 0) {
                const newColumnDefs = columnsToCreate.map((col) => buildColumn(col.type, col.id));
                setActionCols(newColumnDefs);
            }

            // Populate all schedule data at once
            const newSchedule: DailySchedule = {};
            Object.entries(entriesByDayAndHeader).forEach(([date, headerEntries]) => {
                Object.entries(headerEntries).forEach(([columnId, cells]) => {
                    setColumn(cells, newSchedule, columnId, date);
                });
            });
            setDailySchedule(newSchedule);
        } catch (error) {
            console.error("Error processing daily schedule data:", error);
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
            await clearColumn(selectedDate, columnId);

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
                                headerCol: { headerTeacher: item.headerCol.headerTeacher },
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

    const populateEventColumn = (columnId: string, eventTitle: string) => {
        if (!eventTitle.trim()) return;
        clearColumn(selectedDate, columnId);

        const updatedSchedule = setEmptyEventColumn(
            { ...dailySchedule },
            selectedDate,
            eventTitle,
            columnId,
        );

        setDailySchedule(updatedSchedule);
    };

    const addNewColumn = (colType: ActionColumnType) => {
        const columnId = `${colType}-${generateId()}`;
        const newCol = buildColumn(colType, columnId);
        setActionCols([...tableColumns, newCol]);
    };

    const deleteColumn = async (columnId: string) => {
        if (!school?.id) return false;
        const filteredCols = tableColumns.filter((col) => col.id !== columnId);
        if (filteredCols.length === tableColumns.length) return false;

        // Update UI immediately
        setActionCols(filteredCols);
        setDailySchedule((prev) => {
            const updatedSchedule = { ...prev };
            delete updatedSchedule[columnId];
            return updatedSchedule;
        });

        try {
            const response = await deleteDailyColumnAction(school.id, columnId, selectedDate);
            if (response.success && response.dailySchedules) {
                setDailyScheduleRawData(response.dailySchedules);
                return true;
            }
        } catch (error) {
            console.error("Error deleting daily column:", error);
        }
        return false;
    };

    const addNewCell = async (
        type: ColumnType,
        cellData: DailyScheduleCell,
        columnId: string,
        selectedDate: string, // TODOD can remove
        data: { event?: string; subTeacher?: TeacherType },
    ) => {
        let response;
        if (!school) return;

        if (type === "event" && data.event) {
            const dailyCellData = addNewEventCell(
                school,
                cellData,
                columnId,
                selectedDate,
                data.event,
                0,
            );
            if (dailyCellData) response = await addDailyEventCellAction(dailyCellData);
        } else if ((type === "existingTeacher" || type === "missingTeacher") && data.subTeacher) {
            const dailyCellData = addNewSubTeacherCell(
                school,
                cellData,
                columnId,
                selectedDate,
                data.subTeacher,
                type,
                0,
            );
            if (dailyCellData) response = await addDailyTeacherCellAction(dailyCellData);
        }
        if (response?.success && response.data) {
            setDailyScheduleRawData((prev) => {
                if (!response.data) return prev;
                const updatedSchedule = prev ? [...prev, response.data] : [response.data];
                return updatedSchedule;
            });
            return response.data;
        }
        return undefined;
    };

    const updateCell = async (
        type: ColumnType,
        cellData: DailyScheduleCell,
        columnId: string,
        selectedDate: string, // TODOD can remove
        dailyScheduleId: string,
        data: { event?: string; subTeacher?: TeacherType },
    ) => {
        let response;
        if (!school) return;

        if (type === "event" && data.event) {
            const dailyCellData = addNewEventCell(
                school,
                cellData,
                columnId,
                selectedDate,
                data.event,
                0,
            );
            if (dailyCellData)
                response = await updateDailyEventCellAction(dailyScheduleId, dailyCellData);
        } else if ((type === "existingTeacher" || type === "missingTeacher") && data.subTeacher) {
            const dailyCellData = addNewSubTeacherCell(
                school,
                cellData,
                columnId,
                selectedDate,
                data.subTeacher,
                type,
                0,
            );
            if (dailyCellData)
                response = await updateDailyTeacherCellAction(dailyScheduleId, dailyCellData);
        }

        if (response?.success && response.data) {
            setDailyScheduleRawData((prev) => {
                if (!response.data || !prev) return prev;
                const updatedSchedule = prev.map((item) =>
                    item.id === dailyScheduleId ? response.data! : item,
                );
                return updatedSchedule;
            });
            return response.data;
        }
        return undefined;
    };

    const clearColumn = async (day: string, columnId: string) => {
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
                tableColumns,
                dailySchedule,
                dailyScheduleRawData,
                isLoading,
                addNewColumn,
                deleteColumn,
                populateTeacherColumn,
                populateEventColumn,
                addNewCell,
                updateCell,
            }}
        >
            {children}
        </DailyTableContext.Provider>
    );
};
