"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useMainContext } from "./MainContext";
import DailyTeacherCell from "@/components/tables/dailyScheduleTable/DailyTeacherCell/DailyTeacherCell";
import DailyTeacherHeader from "@/components/tables/dailyScheduleTable/DailyTeacherHeader/DailyTeacherHeader";
import EventCell from "@/components/tables/dailyScheduleTable/DailyEventCell/DailyEventCell";
import EventHeader from "@/components/tables/dailyScheduleTable/DailyEventHeader/DailyEventHeader";
import { getAnnualScheduleAction } from "@/app/actions/GET/getAnnualScheduleAction";
import { getDailyScheduleAction } from "@/app/actions/GET/getDailyScheduleAction";
import { getTeacherScheduleByDayAction } from "@/app/actions/GET/getTeacherScheduleByDayAction";
import { addDailyEventCellAction } from "@/app/actions/POST/addDailyEventCellAction";
import { addDailyTeacherCellAction } from "@/app/actions/POST/addDailyTeacherCellAction";
import { updateDailyEventCellAction } from "@/app/actions/PUT/updateDailyEventCellAction";
import { updateDailyEventHeaderAction } from "@/app/actions/PUT/updateDailyEventHeaderAction";
import { updateDailyTeacherCellAction } from "@/app/actions/PUT/updateDailyTeacherCellAction";
import { deleteDailyColumnAction } from "@/app/actions/DELETE/deleteDailyColumnAction";
import { deleteDailyCellAction } from "@/app/actions/DELETE/deleteDailyCellAction";
import { addNewEventCell, addNewTeacherValueCell, fillLeftRowsWithEmptyCells, getColumnsFromStorage, initDailySchedule, mapAnnualTeachers, populateTable, setColumn, setEmptyColumn, setEmptyTeacherColumn, updateAddCell, updateAllEventHeader, updateDeleteCell } from "@/services/dailyScheduleService";
import { ColumnTypeValues, ColumnType, DailySchedule, DailyScheduleCell, DailyScheduleType, TeacherHourlyScheduleItem } from "@/models/types/dailySchedule";
import { AvailableTeachers } from "@/models/types/annualSchedule";
import { SelectOption } from "@/models/types";
import { TeacherType } from "@/models/types/teachers";
import { TeacherRow } from "@/models/types/table";
import { sortColumnsByIssueTeacherType } from "@/utils/sort";
import { generateId } from "@/utils";
import { getIsraeliDateOptions, getTomorrowOption } from "@/resources/dayOptions";
import { getSessionDailyTable, setSessionDailyTable } from "@/lib/sessionStorage";
import { infoToast } from "@/lib/toast";
import { eventPlaceholder } from "@/models/constant/table";
import { DailyTableColors } from "@/style/tableColors";

interface DailyTableContextType {
    tableColumns: ColumnDef<TeacherRow>[];
    mainDailyTable: DailySchedule;
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
    populateEventColumn: (columnId: string, eventTitle: string) => Promise<void>;
    updateTeacherCell: (
        type: ColumnType,
        cellData: DailyScheduleCell,
        columnId: string,
        dailyScheduleId: string,
        data: {
            event?: string;
            subTeacher?: TeacherType;
        },
    ) => Promise<DailyScheduleType | undefined>;
    clearTeacherCell: (
        type: ColumnType,
        cellData: DailyScheduleCell,
        columnId: string,
        dailyScheduleId: string,
    ) => Promise<DailyScheduleType | undefined>;
    updateEventCell: (
        cellData: DailyScheduleCell,
        columnId: string,
        dailyScheduleId: string,
        event?: string,
    ) => Promise<DailyScheduleType | undefined>;
    addEventCell: (
        cellData: DailyScheduleCell,
        columnId: string,
        data: { event?: string; subTeacher?: TeacherType },
    ) => Promise<DailyScheduleType | undefined>;
    deleteEventCell: (
        cellData: DailyScheduleCell,
        columnId: string,
        dailyScheduleId: string,
    ) => Promise<boolean | undefined>;
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
    if (colType === ColumnTypeValues.missingTeacher) {
        return {
            id: columnId,
            header: () => <DailyTeacherHeader columnId={columnId} type={ColumnTypeValues.missingTeacher} />,
            cell: (props) => <DailyTeacherCell cell={props} type={ColumnTypeValues.missingTeacher} />,
            meta: { bgColor: DailyTableColors.missingTeacher.headerColor, type: ColumnTypeValues.missingTeacher },
        };
    }
    if (colType === ColumnTypeValues.existingTeacher) {
        return {
            id: columnId,
            header: () => <DailyTeacherHeader columnId={columnId} type={ColumnTypeValues.existingTeacher} />,
            cell: (props) => <DailyTeacherCell cell={props} type={ColumnTypeValues.existingTeacher} />,
            meta: {
                bgColor: DailyTableColors.existingTeacher.headerColor,
                type: ColumnTypeValues.existingTeacher,
            },
        };
    }
    return {
        id: columnId,
        header: () => <EventHeader columnId={columnId} />,
        cell: (props) => <EventCell cell={props} />,
        meta: { bgColor: DailyTableColors.event.headerColor, type: ColumnTypeValues.event },
    };
}


interface DailyTableProviderProps {
    children: ReactNode;
}

export const DailyTableProvider: React.FC<DailyTableProviderProps> = ({ children }) => {
    const { school, teachers } = useMainContext();

    const [tableColumns, setActionCols] = useState<ColumnDef<TeacherRow>[]>([]);
    const [mainDailyTable, setMainDailyTable] = useState<DailySchedule>({}); // Main state for table object storage
    const [mapAvailableTeachers, setMapAvailableTeachers] = useState<AvailableTeachers>({});
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // -- Select Date -- //
    const daysSelectOptions = () => getIsraeliDateOptions();

    // Pick today if before 16:00, otherwise tomorrow; skip to tomorrow if today not in options (weekend/holiday)
    const [selectedDate, setSelectedDayId] = useState<string>(() => {
        const now = new Date();
        const hour = now.getHours();
        const opts = getIsraeliDateOptions();
        const pad = (n: number) => String(n).padStart(2, "0"); // comment: local YYYY-MM-DD
        const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

        const todayInOpts = opts.find((o) => o.value === todayStr)?.value;
        const tomorrow = getTomorrowOption();

        if (hour < 16) {
            return todayInOpts || tomorrow || opts[0]?.value || todayStr;
        }
        return tomorrow || todayInOpts || opts[0]?.value || todayStr;
    });

    // Handle manual day change from dropdown
    const handleDayChange = (value: string) => setSelectedDayId(value);

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
            try {
                setIsLoading(true);
                const populateFromStorage = populateTableFromStorage();
                if (populateFromStorage) return;
                const targetDate = selectedDate || getTomorrowOption();
                const response = await getDailyScheduleAction(school.id, targetDate);
                if (response.success && response.data && teachers) {
                    populateDailyScheduleTable(response.data);
                } else {
                    infoToast("החיבור למשתמש נותק, יש להיכנס מחדש למערכת.");
                    //console.error("Failed to fetch daily schedule:", response.message);
                }
            } catch (error) {
                console.error("Error fetching daily schedule data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDataForDate();
    }, [school?.id, selectedDate]);

    const setMainAndStorageTable = (newSchedule: DailySchedule) => {
        setMainDailyTable(newSchedule);
        setSessionDailyTable(newSchedule, selectedDate);
    };

    const populateTableFromStorage = () => {
        const tableStorage = getSessionDailyTable();
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
            if (!dataColumns) return;
            if (dataColumns.length === 0) {
                setMainAndStorageTable(setEmptyColumn(mainDailyTable, selectedDate));
                return;
            }

            const { entriesByDayAndHeader, columnsToCreate } = populateTable(
                dataColumns,
                selectedDate,
            );

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

    // -- Teacher Column -- //

    const populateTeacherColumn = async (
        columnId: string,
        dayNumber: number,
        teacherId: string,
        type: ColumnType,
    ) => {
        const schoolId = school?.id;
        if (!schoolId) return;
        try {
            // Delete the old column record if need to update
            const alreadyExists = mainDailyTable[selectedDate]?.[columnId];
            if (alreadyExists) {
                const response = await deleteDailyColumnAction(school.id, columnId, selectedDate);
                if (!response.success || !response.dailySchedules) {
                    console.error("Failed to delete daily column:", response.message);
                }
            }

            clearColumn(selectedDate, columnId);
            const response = await getTeacherScheduleByDayAction(schoolId, dayNumber, teacherId);
            if (response.success && response.data) {
                if (response.data.length > 0) {
                    let updatedSchedule: DailySchedule = { ...mainDailyTable };
                    for (const row of response.data) {
                        const dailyCell = {
                            hour: row.hour,
                            class: row.class,
                            subject: row.subject,
                            headerCol: { headerTeacher: row.headerCol.headerTeacher, type },
                        } as DailyScheduleCell;

                        const newDailyRow = addNewTeacherValueCell(
                            school,
                            dailyCell,
                            columnId,
                            selectedDate,
                            type,
                        );

                        if (newDailyRow) {
                            const response = await addDailyTeacherCellAction(newDailyRow);
                            if (response.success && response.data) {
                                dailyCell.DBid = response.data.id;
                                updatedSchedule = updateAddCell(
                                    response.data.id,
                                    updatedSchedule,
                                    selectedDate,
                                    dailyCell,
                                    columnId,
                                    {},
                                );
                            }
                        }
                    }

                    const headerTeacher = response.data[0].headerCol.headerTeacher;
                    updatedSchedule = fillLeftRowsWithEmptyCells(
                        updatedSchedule,
                        selectedDate,
                        columnId,
                        { headerTeacher, type },
                    );
                    setMainAndStorageTable(updatedSchedule);
                } else {
                    // If the teacher does not teach on this day, create an empty column
                    const headerTeacher = teachers?.find((t) => t.id === teacherId);
                    if (!headerTeacher) return;
                    const updatedSchedule = setEmptyTeacherColumn(
                        { ...mainDailyTable },
                        selectedDate,
                        headerTeacher,
                        columnId,
                        type,
                    );
                    setMainAndStorageTable(updatedSchedule);
                }
                return response.data;
            }
            return undefined;
        } catch (error) {
            console.error("Error fetching teacher schedule:", error);
            return undefined;
        }
    };

    const updateTeacherCell = async (
        type: ColumnType,
        cellData: DailyScheduleCell,
        columnId: string,
        dailyScheduleId: string,
        data: { event?: string; subTeacher?: TeacherType },
    ) => {
        if (!school)
            return;

        const dailyCellData = addNewTeacherValueCell(school, cellData, columnId, selectedDate, type, data.subTeacher, data.event,);
        if (dailyCellData) {
            const response = await updateDailyTeacherCellAction(dailyScheduleId, dailyCellData);
            if (response?.success && response.data) {
                const updatedSchedule = updateAddCell(response.data.id, mainDailyTable, selectedDate, cellData, columnId, data,);
                setMainAndStorageTable(updatedSchedule);
                return response.data;
            }
        }
        return undefined;
    };

    const clearTeacherCell = async (
        type: ColumnType,
        cellData: DailyScheduleCell,
        columnId: string,
        dailyScheduleId: string,
    ) => {
        if (!school) return;
        const dailyCellData = addNewTeacherValueCell(school, cellData, columnId, selectedDate, type, undefined, undefined,);

        if (dailyCellData) {
            const response = await updateDailyTeacherCellAction(dailyScheduleId, dailyCellData);
            if (response?.success && response.data) {
                const updatedSchedule = updateAddCell(response.data.id, mainDailyTable, selectedDate, cellData, columnId, { subTeacher: undefined, event: undefined },);
                setMainAndStorageTable(updatedSchedule);
                return response.data;
            }
        }
        return undefined;
    };

    // -- Event Column -- //
    const populateEventColumn = async (columnId: string, eventTitle: string) => {
        const alreadyExists = mainDailyTable[selectedDate]?.[columnId];
        let updatedSchedule: DailySchedule = { ...mainDailyTable };

        if (alreadyExists) {
            const response = await updateDailyEventHeaderAction(selectedDate, columnId, eventTitle);
            if (response.success) {
                updatedSchedule = updateAllEventHeader(
                    updatedSchedule,
                    selectedDate,
                    columnId,
                    eventTitle,
                );
            } else {
                console.error("Failed to update daily event cell:", response.message);
                return;
            }
        } else {
            clearColumn(selectedDate, columnId);
            updatedSchedule = initDailySchedule(updatedSchedule, selectedDate, columnId);
        }

        updatedSchedule = fillLeftRowsWithEmptyCells(updatedSchedule, selectedDate, columnId, {
            headerEvent: eventTitle,
            type: ColumnTypeValues.event,
        });
        setMainAndStorageTable(updatedSchedule);
    };

    const addEventCell = async (
        cellData: DailyScheduleCell,
        columnId: string,
        data: { event?: string; subTeacher?: TeacherType },
    ) => {
        if (!school) return;
        const eventTitle = data.event || eventPlaceholder;
        const dailyCellData = addNewEventCell(school, cellData, columnId, selectedDate, eventTitle);
        if (dailyCellData) {
            const response = await addDailyEventCellAction(dailyCellData);
            if (response?.success && response.data) {
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
        }
    };

    const updateEventCell = async (
        cellData: DailyScheduleCell,
        columnId: string,
        dailyScheduleId: string,
        event?: string,
    ) => {
        if (!school || event === undefined) return;
        const dailyCellData = addNewEventCell(school, cellData, columnId, selectedDate, event);
        if (dailyCellData) {
            const response = await updateDailyEventCellAction(dailyScheduleId, dailyCellData);
            if (response?.success && response.data) {
                const updatedSchedule = updateAddCell(
                    response.data.id,
                    mainDailyTable,
                    selectedDate,
                    cellData,
                    columnId,
                    { event },
                );
                setMainAndStorageTable(updatedSchedule);

                return response.data;
            }
        }
        return undefined;
    };

    const deleteEventCell = async (
        cellData: DailyScheduleCell,
        columnId: string,
        dailyScheduleId: string,
    ) => {
        if (!school) return;
        const response = await deleteDailyCellAction(school.id, dailyScheduleId);
        if (response?.success && response.deletedRowId) {
            const updatedSchedule = updateDeleteCell(
                response.deletedRowId,
                mainDailyTable,
                selectedDate,
                cellData,
                columnId,
            );
            setMainAndStorageTable(updatedSchedule);

            return true;
        }
    };

    // -- Table Actions -- //

    const addNewColumn = (colType: ColumnType) => {
        const columnId = `${colType}-${generateId()}`;
        const newCol = buildColumn(colType, columnId);
        const sortedCols = sortColumnsByIssueTeacherType([...tableColumns, newCol]);
        setActionCols(sortedCols);
    };

    const deleteColumn = async (columnId: string) => {
        if (!school?.id) return false;

        const prevCols = tableColumns;
        const prevSchedule = mainDailyTable;
        const filteredCols = tableColumns.filter((col) => col.id !== columnId);

        // Update UI immediately
        setActionCols(filteredCols);

        const updatedSchedule = { ...mainDailyTable };
        delete updatedSchedule[selectedDate]?.[columnId];
        setMainAndStorageTable(updatedSchedule);

        try {
            const response = await deleteDailyColumnAction(school.id, columnId, selectedDate);
            if (response.success && response.dailySchedules) {
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
                isLoading,
                selectedDate,
                addNewColumn,
                deleteColumn,
                deleteEventCell,
                populateTeacherColumn,
                populateEventColumn,
                addEventCell,
                updateTeacherCell,
                clearTeacherCell,
                updateEventCell,
                daysSelectOptions,
                handleDayChange,
            }}
        >
            {children}
        </DailyTableContext.Provider>
    );
};
