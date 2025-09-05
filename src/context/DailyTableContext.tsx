"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { TeacherRow } from "@/models/types/table";
import { ColumnDef } from "@tanstack/react-table";
import {
    ColumnType,
    DailySchedule,
    DailyScheduleCell,
    DailyScheduleType,
    TeacherHourlyScheduleItem,
} from "@/models/types/dailySchedule";
import { getDailyScheduleAction } from "@/app/actions/GET/getDailyScheduleAction";
import { getTeacherScheduleByDayAction } from "@/app/actions/GET/getTeacherScheduleByDayAction";
import { getDailyEmptyCellsAction } from "@/app/actions/GET/getDailyEmptyCellsAction";
import { getAnnualScheduleAction } from "@/app/actions/GET/getAnnualScheduleAction";
import { addDailyTeacherCellAction } from "@/app/actions/POST/addDailyTeacherCellAction";
import { updateDailyTeacherCellAction } from "@/app/actions/PUT/updateDailyTeacherCellAction";
import { addDailyEventCellAction } from "@/app/actions/POST/addDailyEventCellAction";
import { updateDailyEventCellAction } from "@/app/actions/PUT/updateDailyEventCellAction";
import { deleteDailyColumnAction } from "@/app/actions/DELETE/deleteDailyColumnAction";
import { useMainContext } from "./MainContext";
import {
    addNewEventCell,
    addNewTeacherValueCell,
    setEmptyTeacherColumn,
    setTeacherColumn,
    setEmptyEventColumn,
    setColumn,
    getColumnsFromStorage,
    updateAddCell,
    populateTable,
    mapAnnualTeachers,
} from "@/services/dailyScheduleService";
import { generateId } from "@/utils";
import DailyTeacherCell from "@/components/dailyScheduleTable/DailyTeacherCell/DailyTeacherCell";
import DailyTeacherHeader from "@/components/dailyScheduleTable/DailyTeacherHeader/DailyTeacherHeader";
import { TeacherType } from "@/models/types/teachers";
import { getDayNumberByDateString } from "@/utils/time";
import EventHeader from "@/components/dailyScheduleTable/DailyEventHeader/DailyEventHeader";
import EventCell from "@/components/dailyScheduleTable/DailyEventCell/DailyEventCell";
import { getIsraeliDateOptions, getTomorrowOption } from "@/resources/dayOptions";
import { SelectOption } from "@/models/types";
import { DailyTableColors } from "@/style/tableColors";
import { eventPlaceholder } from "@/models/constant/table";
import { getStorageDailyTable, setStorageDailyTable } from "@/lib/localStorage";
import { sortColumnsByIssueTeacherType } from "@/utils/sort";
import { AvailableTeachers } from "@/models/types/annualSchedule";

interface DailyTableContextType {
    tableColumns: ColumnDef<TeacherRow>[];
    mainDailyTable: DailySchedule;
    dailyDbRows: DailyScheduleType[] | undefined;
    mapAvailableTeachers: AvailableTeachers;
    isLoading: boolean;
    selectedDate: string;
    addNewColumn: (colType: ColumnType) => void;
    deleteColumn: (columnId: string) => Promise<boolean>;
    populateTeacherColumn: (
        id: string,
        dayNumber: number,
        teacherId: string,
        type: ColumnType,
    ) => Promise<TeacherHourlyScheduleItem[] | undefined>;
    populateEventColumn: (columnId: string, eventTitle: string) => void;
    addNewCell: (
        type: ColumnType,
        cellData: DailyScheduleCell,
        columnId: string,
        data: { event?: string; subTeacher?: TeacherType },
    ) => Promise<DailyScheduleType | undefined>;
    updateCell: (
        type: ColumnType,
        cellData: DailyScheduleCell,
        columnId: string,
        dailyScheduleId: string,
        data: { event?: string; subTeacher?: TeacherType },
    ) => Promise<DailyScheduleType | undefined>;
    addNewCellText: (
        type: ColumnType,
        cellData: DailyScheduleCell,
        columnId: string,
        value: string,
    ) => Promise<DailyScheduleType | undefined>;
    daysSelectOptions: () => SelectOption[];
    handleDayChange: (value: string) => void;
}

const DailyTableContext = createContext<DailyTableContextType | undefined>(undefined);

export const useDailyTableContext = () => {
    const context = useContext(DailyTableContext);
    if (!context) throw new Error("useDailyTableContext must be used within DailyTableProvider");
    return context;
};

function buildColumn(colType: ColumnType, columnId: string): ColumnDef<TeacherRow> {
    if (colType === "missingTeacher") {
        return {
            id: columnId,
            header: () => <DailyTeacherHeader columnId={columnId} type="missingTeacher" />,
            cell: (props) => <DailyTeacherCell cell={props} type="missingTeacher" />,
            meta: { bgColor: DailyTableColors.missingTeacher.headerColor, type: "missingTeacher" },
        };
    }
    if (colType === "existingTeacher") {
        return {
            id: columnId,
            header: () => <DailyTeacherHeader columnId={columnId} type="existingTeacher" />,
            cell: (props) => <DailyTeacherCell cell={props} type="existingTeacher" />,
            meta: {
                bgColor: DailyTableColors.existingTeacher.headerColor,
                type: "existingTeacher",
            },
        };
    }
    return {
        id: columnId,
        header: () => <EventHeader columnId={columnId} />,
        cell: (props) => <EventCell cell={props} />,
        meta: { bgColor: DailyTableColors.event.headerColor, type: "event" },
    };
}

interface DailyTableProviderProps {
    children: ReactNode;
}

export const DailyTableProvider: React.FC<DailyTableProviderProps> = ({ children }) => {
    const { school, teachers } = useMainContext();

    const [tableColumns, setActionCols] = useState<ColumnDef<TeacherRow>[]>([]); // main one for keep in the storage
    const [mainDailyTable, setMainDailyTable] = useState<DailySchedule>({});
    const [dailyDbRows, setDailyDbRows] = useState<DailyScheduleType[] | undefined>(undefined);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [mapAvailableTeachers, setMapAvailableTeachers] = useState<AvailableTeachers>({});

    // -- Select Date -- //
    const [selectedDate, setSelectedDayId] = useState<string>(getTomorrowOption());
    const daysSelectOptions = () => {
        return getIsraeliDateOptions();
    };
    const handleDayChange = (value: string) => {
        setSelectedDayId(value);
    };

    /**
     * Fetch annual schedule and map available teachers for each day and hour
     */
    useEffect(() => {
        const fetchAnnualSchedule = async () => {
            try {
                if (!school?.id) return;
                const response = await getAnnualScheduleAction(school.id);
                if (response.success && response.data) {
                    const teacherMapping: AvailableTeachers = mapAnnualTeachers(response.data);
                    setMapAvailableTeachers(teacherMapping);
                }
            } catch (error) {
                console.error("Error fetching annual schedule:", error);
            }
        };

        fetchAnnualSchedule();
    }, [school?.id]);

    /**
     * Get Daily rows by selected date and populate the table
     */
    useEffect(() => {
        const fetchDataForDate = async () => {
            if (!school?.id || !selectedDate) return;
            setIsLoading(true);
            let dataColumns: DailyScheduleType[] | undefined = [];
            const populateFromStorage = populateTableFromStorage();
            if (populateFromStorage) return;

            try {
                const targetDate = selectedDate || getTomorrowOption();
                const response = await getDailyScheduleAction(school.id, targetDate);
                if (response.success && response.data && teachers) {
                    setDailyDbRows(response.data);
                    dataColumns = response.data;
                } else {
                    console.error("Failed to fetch daily schedule:", response.message);
                    setDailyDbRows([]);
                }
            } catch (error) {
                console.error("Error fetching daily schedule data:", error);
                setDailyDbRows([]);
            } finally {
                setIsLoading(false);
                if (teachers) populateDailyScheduleTable(dataColumns);
            }
        };

        fetchDataForDate();
    }, [school?.id, selectedDate]);

    const setMainAndStorageTable = (newSchedule: DailySchedule) => {
        setMainDailyTable(newSchedule);
        setStorageDailyTable(newSchedule, selectedDate);
    };

    const populateTableFromStorage = () => {
        const tableStorage = getStorageDailyTable();
        if (tableStorage && tableStorage[selectedDate]) {
            setMainDailyTable({ [selectedDate]: tableStorage[selectedDate] });
            // Rebuild columns from storage and restore saved order
            const storageData = tableStorage[selectedDate];
            if (storageData && teachers) {
                const columnsToCreate = getColumnsFromStorage(storageData);
                const newColumns = columnsToCreate.map(({ id, type }) => {
                    return buildColumn(type, id);
                });
                const sortedColumnDefs = sortColumnsByIssueTeacherType(newColumns);
                setActionCols(sortedColumnDefs);
                setIsLoading(false);
            }
            return true;
        }
        return false;
    };

    const populateDailyScheduleTable = async (dataColumns: DailyScheduleType[]) => {
        try {
            clearDailySchedule();
            if (!dataColumns || dataColumns.length === 0) return;

            const { entriesByDayAndHeader, columnsToCreate, existingCells } = populateTable(
                dataColumns,
                selectedDate,
            );

            if (existingCells.length > 0 && school) {
                const day = getDayNumberByDateString(selectedDate);
                const response = await getDailyEmptyCellsAction(school.id, day, existingCells);
                if (response.success && response.data && response.data.length > 0) {
                    response.data.forEach((cellData) => {
                        const columnid = dataColumns.find(
                            (col) => col.issueTeacher?.id === cellData.headerCol?.headerTeacher?.id,
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
                const sortedColumnDefs = sortColumnsByIssueTeacherType(newColumnDefs);
                setActionCols(sortedColumnDefs);
            }

            // Populate all schedule data at once
            const newSchedule: DailySchedule = {};
            Object.entries(entriesByDayAndHeader).forEach(([date, headerEntries]) => {
                Object.entries(headerEntries).forEach(([columnId, cells]) => {
                    setColumn(cells, newSchedule, columnId, date);
                });
            });
            setMainAndStorageTable(newSchedule);
        } catch (error) {
            console.error("Error processing daily schedule data:", error);
        }
    };

    const populateTeacherColumn = async (
        columnId: string,
        dayNumber: number,
        teacherId: string,
        type: ColumnType,
    ) => {
        const schoolId = school?.id;
        if (!schoolId) return;
        try {
            clearColumn(selectedDate, columnId);

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
                                headerCol: { headerTeacher: item.headerCol.headerTeacher, type },
                            }) as DailyScheduleCell,
                    );

                    updatedSchedule = setTeacherColumn(
                        { ...mainDailyTable },
                        selectedDate,
                        scheduleData,
                        columnId,
                    );
                } else {
                    const headerTeacher = teachers?.find((t) => t.id === teacherId);
                    if (!headerTeacher) return;

                    updatedSchedule = setEmptyTeacherColumn(
                        { ...mainDailyTable },
                        selectedDate,
                        headerTeacher,
                        columnId,
                        type,
                    );
                }
                setMainAndStorageTable(updatedSchedule);
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
            { ...mainDailyTable },
            selectedDate,
            eventTitle,
            columnId,
        );

        setMainAndStorageTable(updatedSchedule);
    };

    const addNewCell = async (
        type: ColumnType,
        cellData: DailyScheduleCell,
        columnId: string,
        data: { event?: string; subTeacher?: TeacherType },
    ) => {
        if (!school) return;
        let response;
        const position = 0;

        if (type === "event") {
            const eventTitle = data.event || eventPlaceholder;
            const dailyCellData = addNewEventCell(
                school,
                cellData,
                columnId,
                selectedDate,
                eventTitle,
                position,
            );
            if (dailyCellData) response = await addDailyEventCellAction(dailyCellData);
        } else if ((type === "existingTeacher" || type === "missingTeacher") && data.subTeacher) {
            const dailyCellData = addNewTeacherValueCell(
                school,
                cellData,
                columnId,
                selectedDate,
                type,
                position,
                data.subTeacher,
                undefined,
            );
            if (dailyCellData) response = await addDailyTeacherCellAction(dailyCellData);
        }
        if (response?.success && response.data) {
            addTeacherResponse(response.data, cellData, columnId, data);
            return response.data;
        }
        return undefined;
    };

    const addNewCellText = async (
        type: ColumnType,
        cellData: DailyScheduleCell,
        columnId: string,
        value: string,
    ): Promise<DailyScheduleType | undefined> => {
        if (!school) return;

        const position = 0;
        const newDailyRow = addNewTeacherValueCell(
            school,
            cellData,
            columnId,
            selectedDate,
            type,
            position,
            undefined,
            value,
        );
        if (newDailyRow) {
            const response = await addDailyTeacherCellAction(newDailyRow);
            if (response.success && response.data) {
                addTeacherResponse(response.data, cellData, columnId, { event: value });
                return response.data;
            }
        }

        return undefined;
    };

    const addTeacherResponse = (
        response: DailyScheduleType,
        cellData: DailyScheduleCell,
        columnId: string,
        data: { event?: string; subTeacher?: TeacherType },
    ) => {
        setDailyDbRows((prev) => {
            if (!response) return prev;
            const updatedSchedule = prev ? [...prev, response] : [response];
            return updatedSchedule;
        });

        const updatedSchedule = updateAddCell(
            response.id,
            mainDailyTable,
            selectedDate,
            cellData,
            columnId,
            data,
        );
        setMainAndStorageTable(updatedSchedule);
    };

    const updateCell = async (
        type: ColumnType,
        cellData: DailyScheduleCell,
        columnId: string,
        dailyScheduleId: string,
        data: { event?: string; subTeacher?: TeacherType },
    ) => {
        let response;
        const position = 0;
        if (!school) return;
        if (type === "event" && data.event) {
            const dailyCellData = addNewEventCell(
                school,
                cellData,
                columnId,
                selectedDate,
                data.event,
                position,
            );
            if (dailyCellData)
                response = await updateDailyEventCellAction(dailyScheduleId, dailyCellData);
        } else if (type === "existingTeacher" || type === "missingTeacher") {
            const dailyCellData = addNewTeacherValueCell(
                school,
                cellData,
                columnId,
                selectedDate,
                type,
                position,
                data.subTeacher,
                data.event,
            );
            if (dailyCellData)
                response = await updateDailyTeacherCellAction(dailyScheduleId, dailyCellData);
        }
        if (response?.success && response.data) {
            setDailyDbRows((prev) => {
                if (!response.data || !prev) return prev;
                const updatedSchedule = prev.map((item) =>
                    item.id === dailyScheduleId ? response.data! : item,
                );
                return updatedSchedule;
            });

            const updatedSchedule = updateAddCell(
                response.data.id,
                mainDailyTable,
                selectedDate,
                cellData,
                columnId,
                data,
            );
            setMainAndStorageTable(updatedSchedule);

            return response.data;
        }
        return undefined;
    };

    // -- Table Actions -- //

    const addNewColumn = (colType: ColumnType) => {
        const columnId = `${colType}-${generateId()}`;
        const newCol = buildColumn(colType, columnId);
        const sortedCols = sortColumnsByIssueTeacherType([...tableColumns, newCol]);
        setActionCols(sortedCols);
    };

    // TODO: check why lior did the change
    const deleteColumn = async (columnId: string) => {
        if (!school?.id) return false;

        const prevCols = tableColumns;
        const prevSchedule = mainDailyTable;
        const filteredCols = tableColumns.filter((col) => col.id !== columnId);

        setActionCols(filteredCols);

        const day = selectedDate;
        const nextDay = { ...(mainDailyTable[day] || {}) };
        delete nextDay[columnId];
        const nextSchedule = { ...mainDailyTable, [day]: nextDay };
        setMainAndStorageTable(nextSchedule);

        try {
            const response = await deleteDailyColumnAction(school.id, columnId, day);
            if (response.success && response.dailySchedules) {
                setDailyDbRows(response.dailySchedules);
                return true;
            }
            throw new Error(response.message || "delete failed");
        } catch (error) {
            // Rollback
            setActionCols(prevCols);
            setMainAndStorageTable(prevSchedule);
            console.error("Error deleting daily column:", error);
            return false;
        }
    };

    // const filteredCols = tableColumns.filter((col) => col.id !== columnId);
    // if (filteredCols.length === tableColumns.length) return false;
    // const sortedCols = sortColumnsByIssueTeacherType(filteredCols);

    // // Update UI immediately
    // setActionCols(sortedCols);

    // const updatedSchedule = { ...mainDailyTable };
    // delete updatedSchedule[selectedDate]?.[columnId];
    // setMainAndStorageTable(updatedSchedule);
    // try {
    //     const response = await deleteDailyColumnAction(school.id, columnId, selectedDate);
    //     if (response.success && response.dailySchedules) {
    //         setDailyDbRows(response.dailySchedules);
    //         return true;
    //     }
    // } catch (error) {
    //     console.error("Error deleting daily column:", error);
    // }

    const clearColumn = (day: string, columnId: string) => {
        const updatedSchedule = { ...mainDailyTable };

        if (updatedSchedule[day] && updatedSchedule[day][columnId]) {
            updatedSchedule[day][columnId] = {};
        }

        setMainAndStorageTable(updatedSchedule);
    };

    const clearDailySchedule = () => {
        setMainAndStorageTable({});
        setActionCols([]);
    };

    return (
        <DailyTableContext.Provider
            value={{
                tableColumns,
                mainDailyTable,
                mapAvailableTeachers,
                dailyDbRows,
                isLoading,
                selectedDate,
                addNewColumn,
                deleteColumn,
                populateTeacherColumn,
                populateEventColumn,
                addNewCell,
                updateCell,
                addNewCellText,
                daysSelectOptions,
                handleDayChange,
            }}
        >
            {children}
        </DailyTableContext.Provider>
    );
};
