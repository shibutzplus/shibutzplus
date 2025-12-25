"use client";

import { SelectOption } from "@/models/types";
import {
    ColumnType,
    DailySchedule,
    DailyScheduleCell,
    DailyScheduleType,
    TeacherHourlyScheduleItem,
} from "@/models/types/dailySchedule";
import useDailySelectedDate from "@/hooks/daily/useDailySelectedDate";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useMainContext } from "./MainContext";
import { getSessionDailyTable, setSessionDailyTable } from "@/lib/sessionStorage";
import { TeacherType } from "@/models/types/teachers";
import useDailyTeacherActions from "@/hooks/daily/useDailyTeacherActions";
import { getAnnualScheduleAction } from "@/app/actions/GET/getAnnualScheduleAction";
import { AvailableTeachers, TeacherClassMap } from "@/models/types/annualSchedule";
import { getTomorrowOption } from "@/resources/dayOptions";
import { getDailyScheduleAction } from "@/app/actions/GET/getDailyScheduleAction";
import { errorToast } from "@/lib/toast";
import { generateId } from "@/utils";
import { deleteDailyColumnAction } from "@/app/actions/DELETE/deleteDailyColumnAction";
import useDailyEventActions from "@/hooks/daily/useDailyEventActions";
import {
    mapAnnualTeachers,
    populateDailyScheduleTable,
    mapAnnualTeacherClasses,
} from "@/services/daily/populate";
import { createNewEmptyColumn } from "@/services/daily/setEmpty";
import { useDailyEditMode } from "@/hooks/daily/useDailyEditMode";
import { sortDailyColumnIdsByPosition } from "@/utils/sort";
import { ColumnTypeValues } from "@/models/types/dailySchedule";

const COLUMN_PRIORITY: Record<ColumnType, number> = {
    [ColumnTypeValues.missingTeacher]: 0,
    [ColumnTypeValues.existingTeacher]: 1,
    [ColumnTypeValues.event]: 2,
    [ColumnTypeValues.empty]: 1,
};

interface DailyTableContextType {
    mainDailyTable: DailySchedule;
    mapAvailableTeachers: AvailableTeachers;
    teacherClassMap: TeacherClassMap;
    isLoading: boolean;
    isEditMode: boolean;
    isLoadingEditPage: boolean;
    selectedDate: string;
    addNewEmptyColumn: (colType: ColumnType) => void;
    deleteColumn: (columnId: string) => Promise<boolean>;
    populateTeacherColumn: (
        selectedDate: string,
        columnId: string,
        dayNumber: number,
        teacherId: string,
        type: ColumnType,
    ) => Promise<TeacherHourlyScheduleItem[] | undefined>;
    populateEventColumn: (columnId: string, eventTitle: string) => Promise<void>;
    updateTeacherCell: (
        selectedDate: string,
        type: ColumnType,
        cellData: DailyScheduleCell,
        columnId: string,
        dailyScheduleId: string,
        data: {
            event?: string;
            subTeacher?: TeacherType;
        },
    ) => Promise<DailyScheduleCell | undefined>;
    clearTeacherCell: (
        selectedDate: string,
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
    changeDailyMode: () => void;
    moveColumn: (columnId: string, direction: "left" | "right") => Promise<void>;
}

const DailyTableContext = createContext<DailyTableContextType | undefined>(undefined);

export const useDailyTableContext = () => {
    const context = useContext(DailyTableContext);
    if (!context) throw new Error("useDailyTableContext must be used within DailyTableProvider");
    return context;
};

interface DailyTableProviderProps {
    children: ReactNode;
}

export const DailyTableProvider: React.FC<DailyTableProviderProps> = ({ children }) => {
    const { school, teachers, settings } = useMainContext();

    // Main state for table object storage
    const [mainDailyTable, setMainDailyTable] = useState<DailySchedule>({});
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [mapAvailableTeachers, setMapAvailableTeachers] = useState<AvailableTeachers>({});
    const [teacherClassMap, setTeacherClassMap] = useState<TeacherClassMap>({});

    const { isEditMode, isLoadingEditPage, changeDailyMode } = useDailyEditMode();

    // Select Date
    const { daysSelectOptions, selectedDate, handleDayChange } = useDailySelectedDate();

    const setMainAndStorageTable = (newSchedule: DailySchedule) => {
        setMainDailyTable({ ...newSchedule });
        setSessionDailyTable(newSchedule, selectedDate);
    };

    const clearColumn = (day: string, columnId: string) => {
        const updatedSchedule = { ...mainDailyTable };

        if (updatedSchedule[day]) {
            updatedSchedule[day] = { ...updatedSchedule[day] };
            if (updatedSchedule[day][columnId]) {
                updatedSchedule[day][columnId] = {};
            }
        }

        setMainAndStorageTable(updatedSchedule);
    };

    // Teacher Column Actions
    const { populateTeacherColumn, updateTeacherCell, clearTeacherCell } = useDailyTeacherActions(
        mainDailyTable,
        setMainAndStorageTable,
        clearColumn,
    );

    // Event Column Actions
    const { populateEventColumn, addEventCell, updateEventCell, deleteEventCell } =
        useDailyEventActions(mainDailyTable, setMainAndStorageTable, clearColumn, selectedDate);

    // Fetch annual schedule and map available teachers for each day and hour
    useEffect(() => {
        const fetchAnnualSchedule = async () => {
            try {
                if (!school?.id) return;
                const response = await getAnnualScheduleAction(school.id);
                if (response.success && response.data) {
                    const teacherMapping: AvailableTeachers = mapAnnualTeachers(response.data);
                    const classMapping: TeacherClassMap = mapAnnualTeacherClasses(response.data);

                    setMapAvailableTeachers(teacherMapping);
                    setTeacherClassMap(classMapping);
                }
            } catch (error) {
                console.error("Error fetching annual schedule:", error);
            }
        };

        fetchAnnualSchedule();
    }, [school?.id]);

    // Get Daily rows by selected date and populate the table
    useEffect(() => {
        const fetchDataForDate = async () => {
            if (!school?.id || !selectedDate) return;
            try {
                setIsLoading(true);
                const populateFromStorage = populateTableFromStorage();
                if (populateFromStorage) return;
                const targetDate = selectedDate || getTomorrowOption();
                const response = await getDailyScheduleAction(school.id, targetDate);
                if (response.success && response.data) {
                    const newSchedule = await populateDailyScheduleTable(
                        mainDailyTable,
                        selectedDate,
                        response.data,
                        settings?.hoursNum
                    );
                    if (newSchedule) setMainAndStorageTable(newSchedule);
                } else {
                    errorToast("החיבור למשתמש נכשל. התנתקו ונסו שוב.");
                }
            } catch (error) {
                console.error("Error fetching daily schedule data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDataForDate();
    }, [school?.id, selectedDate, teachers]);

    const populateTableFromStorage = () => {
        const tableStorage = getSessionDailyTable();
        if (tableStorage && tableStorage[selectedDate]) {
            setMainDailyTable({ [selectedDate]: tableStorage[selectedDate] });
            // Rebuild columns from storage and restore saved order
            const storageData = tableStorage[selectedDate];
            if (storageData && teachers) setIsLoading(false);
            return true;
        }
        return false;
    };



    const deleteColumn = async (columnId: string) => {
        if (!school?.id) return false;
        const prevSchedule = { ...mainDailyTable };

        const updatedSchedule = { ...mainDailyTable };
        const columnToDelete = updatedSchedule[selectedDate]?.[columnId];

        // Check if any cell in this column has a DBid. 
        // If so, it means there are records in the database that need to be deleted.
        const hasSavedData = columnToDelete ? Object.values(columnToDelete).some(cell => !!cell.DBid) : false;

        delete updatedSchedule[selectedDate]?.[columnId];
        setMainAndStorageTable(updatedSchedule);

        // If no data was saved to DB, we don't need to call the API
        if (!hasSavedData) {
            return true;
        }

        try {
            const response = await deleteDailyColumnAction(school.id, columnId, selectedDate);
            if (response.success && response.dailySchedules) {
                return true;
            }
            throw new Error(response.message || "delete failed");
        } catch (error) {
            // Rollback
            setMainAndStorageTable(prevSchedule);
            console.error("Error deleting daily column:", error);
            return false;
        }
    };

    const POSITION_GAP = 1000;
    const REBALANCE_THRESHOLD = 10; // If gap is smaller than this, rebalance

    const rebalanceColumns = async (sortedColumnIds: string[], schedule: DailySchedule) => {
        if (!school?.id) return;

        const updates: { columnId: string; position: number }[] = [];
        const newSchedule = { ...schedule };
        // Create a shallow copy of the day's schedule to avoid mutating the original
        if (newSchedule[selectedDate]) {
            newSchedule[selectedDate] = { ...newSchedule[selectedDate] };
        } else {
            newSchedule[selectedDate] = {};
        }

        sortedColumnIds.forEach((colId, index) => {
            const newPos = (index + 1) * POSITION_GAP;

            // Optimization: Only send update to DB if position actually changes
            // We check hour "0" (metadata) or hour "1" (visual) for the current position
            const currentColumn = schedule[selectedDate]?.[colId];
            const currentPos = currentColumn?.["0"]?.DBid
                ? (currentColumn["0"].headerCol?.position || 0)
                : (currentColumn?.["1"]?.headerCol?.position || 0);

            if (currentPos !== newPos) {
                updates.push({ columnId: colId, position: newPos });
            }

            // Update local state immediately
            // Ensure we copy the column and iterate all cells to update position
            if (newSchedule[selectedDate][colId]) {
                newSchedule[selectedDate][colId] = { ...newSchedule[selectedDate][colId] };
                Object.keys(newSchedule[selectedDate][colId]).forEach((key) => {
                    const cell = newSchedule[selectedDate][colId][key];
                    if (cell && cell.headerCol) {
                        newSchedule[selectedDate][colId][key] = {
                            ...cell,
                            headerCol: {
                                ...cell.headerCol,
                                position: newPos,
                            },
                        };
                    }
                });
            }
        });

        setMainAndStorageTable(newSchedule);

        try {
            const { updateDailyColumnPositionsAction } = await import("@/app/actions/PUT/updateDailyColumnPositionsAction");
            await updateDailyColumnPositionsAction(school.id, selectedDate, updates);
        } catch (error) {
            console.error("Error rebalancing columns:", error);
        }
    };

    const addNewEmptyColumn = (type: ColumnType) => {
        const newColumnId = `${type}-${generateId()}`;

        const schedule = mainDailyTable[selectedDate] || {};
        const existingColumns = Object.keys(schedule);
        const sortedColumns = sortDailyColumnIdsByPosition(existingColumns, schedule);

        const newPriority = COLUMN_PRIORITY[type];

        // Find insertion index: after all columns with <= priority, before any with > priority
        // Since the array is sorted by position, we just need to find the first column
        // that has a strictly HIGHER priority (should come after our new column).
        // Our new column goes before that one.
        let insertIndex = sortedColumns.findIndex((colId) => {
            const colType = schedule[colId]?.["1"]?.headerCol?.type || ColumnTypeValues.existingTeacher;
            const colPriority = COLUMN_PRIORITY[colType] ?? 1;
            return colPriority > newPriority;
        });

        // If not found, it means all existing columns have <= priority, so append to end
        if (insertIndex === -1) {
            insertIndex = sortedColumns.length;
        }

        // Calculate Position
        const prevId = insertIndex > 0 ? sortedColumns[insertIndex - 1] : null;
        const nextId = insertIndex < sortedColumns.length ? sortedColumns[insertIndex] : null;

        const prevPos = prevId ? (schedule[prevId]?.["1"]?.headerCol?.position || 0) : 0;
        // If nextId is null, it means we are inserting at the very end.
        // In this case, nextPos should be prevPos + 2*POSITION_GAP to ensure a gap.
        const nextPos = nextId ? (schedule[nextId]?.["1"]?.headerCol?.position || ((prevPos || 0) + POSITION_GAP * 2)) : ((prevPos || 0) + POSITION_GAP * 2);

        let newPos = Math.floor((prevPos + nextPos) / 2);

        // Check collision or creation of 0-gap
        // If newPos is equal to prevPos or nextPos, or if inserting at the start and nextPos is too small (e.g., 0 or 1),
        // it indicates a need for rebalancing.
        if (newPos === prevPos || newPos === nextPos || (insertIndex === 0 && nextPos < REBALANCE_THRESHOLD)) {
            // Rebalance everything including the new column
            const newColsList = [...sortedColumns];
            newColsList.splice(insertIndex, 0, newColumnId);

            // Create empty column first with placeholder pos
            const tempSchedule = createNewEmptyColumn(
                mainDailyTable,
                selectedDate,
                newColumnId,
                type,
                0, // Placeholder position, will be updated by rebalance
                settings?.hoursNum
            );

            // Pass this temp schedule to rebalance so it knows about the new column
            rebalanceColumns(newColsList, tempSchedule);
            return;
        }

        // Normal Insert
        const finalSchedule = createNewEmptyColumn(
            mainDailyTable,
            selectedDate,
            newColumnId,
            type,
            newPos,
            settings?.hoursNum
        );
        setMainAndStorageTable(finalSchedule);
    };

    const moveColumn = async (columnId: string, direction: "left" | "right") => {
        if (!school?.id) return;
        const schedule = mainDailyTable[selectedDate] || {};
        const columnIds = Object.keys(schedule);
        const sortedCols = sortDailyColumnIdsByPosition(columnIds, schedule);

        const currentIndex = sortedCols.indexOf(columnId);
        if (currentIndex === -1) return;

        // Determine the target index in the sorted array
        // "Right" in visual RTL means moving towards the start of the array (lower index)
        // "Left" in visual RTL means moving towards the end of the array (higher index)
        const targetIndex = direction === "right" ? currentIndex - 1 : currentIndex + 1;

        if (targetIndex < 0 || targetIndex >= sortedCols.length) return;

        // Construct the DESIRED array order after the move
        const newOrder = [...sortedCols];
        const [movedItem] = newOrder.splice(currentIndex, 1);
        newOrder.splice(targetIndex, 0, movedItem);

        // Instead of calculating average positions (which fails with legacy 0 data),
        // we forcefully rebalance the entire day's columns to guarantee the new order.
        // This ensures positions are always clean (1000, 2000, 3000...)
        rebalanceColumns(newOrder, mainDailyTable);
    };

    return (
        <DailyTableContext.Provider
            value={{
                selectedDate,
                mainDailyTable,
                isLoading,
                isEditMode,
                isLoadingEditPage,
                mapAvailableTeachers,
                teacherClassMap,
                addNewEmptyColumn,
                deleteColumn,
                daysSelectOptions,
                handleDayChange,
                populateTeacherColumn,
                updateTeacherCell,
                clearTeacherCell,
                populateEventColumn,
                addEventCell,
                updateEventCell,
                deleteEventCell,
                changeDailyMode,
                moveColumn,
            }}
        >
            {children}
        </DailyTableContext.Provider>
    );
};
