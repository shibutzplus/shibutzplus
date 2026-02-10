"use client";

import { createContext, ReactNode, useContext, useEffect, useState, useRef } from "react";
import { useMainContext } from "./MainContext";
import { SelectOption } from "@/models/types";
import { ColumnType, DailySchedule, DailyScheduleCell, DailyScheduleType, TeacherHourlyScheduleItem, ColumnTypeValues } from "@/models/types/dailySchedule";
import { TeacherType } from "@/models/types/teachers";
import { AvailableTeachers, TeacherClassMap } from "@/models/types/annualSchedule";
import { DAILY_TEACHER_COL_DATA_CHANGED, DAILY_EVENT_COL_DATA_CHANGED, DAILY_PUBLISH_DATA_CHANGED } from "@/models/constant/sync";
import useDailySelectedDate from "@/hooks/daily/useDailySelectedDate";
import useDailyTeacherActions from "@/hooks/daily/useDailyTeacherActions";
import useDailyEventActions from "@/hooks/daily/useDailyEventActions";
import { usePollingUpdates } from "@/hooks/usePollingUpdates";
import { getAnnualScheduleAction } from "@/app/actions/GET/getAnnualScheduleAction";
import { getDailyScheduleAction } from "@/app/actions/GET/getDailyScheduleAction";
import { getSystemRecommendationsAction } from "@/app/actions/GET/getSystemRecommendationsAction";
import { deleteDailyColumnAction } from "@/app/actions/DELETE/deleteDailyColumnAction";
import { SyncItem, SyncChannel } from "@/services/sync/clientSyncService";
import { mapAnnualTeachers, populateDailyScheduleTable, mapAnnualTeacherClasses, } from "@/services/daily/populate";
import { initializeEmptyColumn } from "@/services/daily/setEmpty";
import { generateId } from "@/utils";
import { sortDailyColumnIdsByPosition } from "@/utils/sort";
import { validateMaxColumns } from "@/utils/security";
import { getTomorrowOption } from "@/resources/dayOptions";
import { errorToast } from "@/lib/toast";
import { logErrorAction } from "@/app/actions/POST/logErrorAction";

const SCHEDULE_CHANNELS: SyncChannel[] = [
    DAILY_TEACHER_COL_DATA_CHANGED,
    DAILY_EVENT_COL_DATA_CHANGED,
    DAILY_PUBLISH_DATA_CHANGED
];

const COLUMN_PRIORITY: Record<ColumnType, number> = {
    [ColumnTypeValues.missingTeacher]: 0,
    [ColumnTypeValues.existingTeacher]: 1,
    [ColumnTypeValues.event]: 2,
};
const POSITION_GAP = 1000;
const REBALANCE_THRESHOLD = 10; // If gap is smaller than rebalance

interface DailyTableContextType {
    mainDailyTable: DailySchedule;
    mapAvailableTeachers: AvailableTeachers;
    teacherClassMap: TeacherClassMap;
    isLoading: boolean;
    isPreviewMode: boolean;
    selectedDate: string;
    systemRecommendations: Record<string, Record<string, string[]>>;
    addNewEmptyColumn: (colType: ColumnType) => void;
    deleteColumn: (columnId: string) => Promise<boolean>;
    populateTeacherColumn: (selectedDate: string, columnId: string, dayNumber: number, teacherId: string, type: ColumnType,) => Promise<TeacherHourlyScheduleItem[] | undefined>;
    populateEventColumn: (columnId: string, eventTitle: string) => Promise<void>;
    updateTeacherCell: (
        selectedDate: string,
        type: ColumnType,
        cellData: DailyScheduleCell,
        columnId: string,
        dailyScheduleId: string,
        data: { event?: string; subTeacher?: TeacherType; },
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
    pasteEventColumn: (columnId: string, pastedColumnData: { [hour: string]: DailyScheduleCell }) => Promise<boolean>;
    daysSelectOptions: (short?: boolean) => SelectOption[];
    handleDayChange: (value: string) => void;
    togglePreviewMode: () => void;
    moveColumn: (columnId: string, direction: "left" | "right") => Promise<void>;
}

const updateColumnPositionInSchedule = (
    daySchedule: { [columnId: string]: { [hour: string]: DailyScheduleCell } },
    columnId: string,
    newPosition: number
) => {
    if (!daySchedule[columnId]) return;

    daySchedule[columnId] = { ...daySchedule[columnId] };
    Object.keys(daySchedule[columnId]).forEach((key) => {
        const cell = daySchedule[columnId][key];
        if (cell && cell.headerCol) {
            daySchedule[columnId][key] = {
                ...cell,
                headerCol: { ...cell.headerCol, position: newPosition },
            };
        }
    });
};

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

    const { school, setSchool, teachers, subjects, classes, settings } = useMainContext();
    const [mainDailyTable, setMainDailyTable] = useState<DailySchedule>({});
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [mapAvailableTeachers, setMapAvailableTeachers] = useState<AvailableTeachers>({});
    const [teacherClassMap, setTeacherClassMap] = useState<TeacherClassMap>({});
    const [recommendationsCache, setRecommendationsCache] = useState<Record<number, Record<string, Record<string, string[]>>>>({});
    const refreshScheduleRef = useRef<((items: SyncItem[]) => Promise<void> | void) | null>(null);
    usePollingUpdates(refreshScheduleRef, SCHEDULE_CHANNELS);
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const togglePreviewMode = () => { setIsPreviewMode((prev) => !prev); };
    const { daysSelectOptions, selectedDate, handleDayChange } = useDailySelectedDate();
    const currentDayIndex = selectedDate ? new Date(selectedDate).getDay() + 1 : 0;
    const systemRecommendations = recommendationsCache[currentDayIndex] || {};

    const clearColumn = (day: string, columnId: string) => {
        setMainDailyTable(prev => {
            const updatedSchedule = { ...prev };

            if (updatedSchedule[day]) {
                updatedSchedule[day] = { ...updatedSchedule[day] };
                if (updatedSchedule[day][columnId]) {
                    updatedSchedule[day][columnId] = {};
                }
            }

            return updatedSchedule;
        });
    };

    // Teacher Column
    const { populateTeacherColumn, updateTeacherCell, clearTeacherCell } = useDailyTeacherActions(
        mainDailyTable,
        setMainDailyTable,
        clearColumn
    );

    // Event Column
    const { populateEventColumn, addEventCell, updateEventCell, deleteEventCell, pasteEventColumn } =
        useDailyEventActions(mainDailyTable, setMainDailyTable, selectedDate);

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
                logErrorAction({ description: `Error fetching annual schedule: ${error instanceof Error ? error.message : String(error)}`, schoolId: school?.id });
            }
        };

        fetchAnnualSchedule();
    }, [school?.id]);

    // Fetch System Recommendations (based on school/date)
    useEffect(() => {
        const fetchRecommendations = async () => {
            if (!school?.id || !selectedDate) return;

            const day = new Date(selectedDate).getDay() + 1;
            try {
                const recResponse = await getSystemRecommendationsAction(school.id, day);
                if (recResponse.success && recResponse.data) {
                    setRecommendationsCache(prev => ({
                        ...prev,
                        [day]: recResponse.data
                    }));
                }
            } catch (recError) {
                logErrorAction({ description: `Error fetching recommendations: ${recError instanceof Error ? recError.message : String(recError)}`, schoolId: school?.id });
            }
        };

        fetchRecommendations();
    }, [school?.id, selectedDate]);

    // Get Daily rows by date and populate the table
    useEffect(() => {
        const fetchDataForDate = async (isBackground = false) => {
            if (!school?.id || !selectedDate) return;
            try {
                if (!isBackground) setIsLoading(true);
                const targetDate = selectedDate || getTomorrowOption();
                const response = await getDailyScheduleAction(school.id, targetDate);
                if (response.success && response.data) {
                    setMainDailyTable((prevTable) => {
                        const newSchedule = populateDailyScheduleTable(
                            prevTable,
                            selectedDate,
                            response.data,
                            settings?.fromHour ?? 1,
                            settings?.toHour ?? 10,
                            teachers || [],
                            classes || [],
                            subjects || []
                        );
                        return newSchedule || prevTable;
                    });
                } else {
                    if (!isBackground) errorToast("חלה שגיאה באימות המשתמש. נא להתנתק ולהתחבר מחדש.");
                }
            } catch (error) {
                logErrorAction({ description: `Error fetching daily schedule data (daily table): ${error instanceof Error ? error.message : String(error)}`, schoolId: school?.id });
            } finally {
                if (!isBackground) setIsLoading(false);
            }
        };

        fetchDataForDate();

        refreshScheduleRef.current = async (items) => {
            // 1. Handle School Data Updates (Publish/Unpublish)
            // These affect the global school object (publishDates array), so we accepting them regardless of the currently selected date.
            const publishUpdates = items.filter(item => {
                if (!item.payload) return true; // Assume relevant if no payload
                if (item.payload.schoolId && item.payload.schoolId !== school?.id) return false;
                // Note: We intentionally DO NOT filter by date here, because school.publishDates covers all dates.
                return item.channel === DAILY_PUBLISH_DATA_CHANGED;
            });

            if (publishUpdates.length > 0) {
                try {
                    const { getSchoolAction } = await import("@/app/actions/GET/getSchoolAction");
                    if (school?.id) {
                        const schoolRes = await getSchoolAction(school.id);
                        if (schoolRes.success && schoolRes.data) {
                            setSchool(schoolRes.data);
                        }
                    }
                } catch (e) {
                    logErrorAction({ description: `Failed to refresh school data (polling): ${e instanceof Error ? e.message : String(e)}`, schoolId: school?.id });
                }
            }

            // 2. Handle Daily Schedule Updates
            // These are specific to the view, so we strictly filter by the selected date.
            const scheduleUpdates = items.filter(item => {
                if (!item.payload) return true;
                if (Object.keys(item.payload).length === 0) return false; // Ignore empty payload
                if (item.payload.schoolId && item.payload.schoolId !== school?.id) return false;
                if (item.payload.date && item.payload.date !== selectedDate) return false;

                // Exclude publish events (handled above)
                return item.channel !== DAILY_PUBLISH_DATA_CHANGED;
            });

            if (scheduleUpdates.length > 0) {
                // Background refresh based on sync event
                await fetchDataForDate(true);
            }
        };
    }, [school?.id, selectedDate, teachers, setSchool]);

    const deleteColumn = async (columnId: string) => {
        if (!school?.id) return false;

        // Store the column data for potential rollback
        const columnToDelete = mainDailyTable[selectedDate]?.[columnId];
        const hasSavedData = columnToDelete ? Object.values(columnToDelete).some(cell => !!cell.DBid) : false;

        // Optimistic delete
        setMainDailyTable(prev => {
            const updatedSchedule = { ...prev };
            if (updatedSchedule[selectedDate]) {
                updatedSchedule[selectedDate] = { ...updatedSchedule[selectedDate] };
                delete updatedSchedule[selectedDate][columnId];
            }
            return updatedSchedule;
        });

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
            // Rollback: refetch to ensure consistency
            logErrorAction({ description: `Error deleting daily column: ${error instanceof Error ? error.message : String(error)}`, schoolId: school?.id });
            // Force a refresh to get the correct state from server
            if (school?.id && selectedDate) {
                const response = await getDailyScheduleAction(school.id, selectedDate);
                if (response.success && response.data) {
                    setMainDailyTable((prevTable) => {
                        const newSchedule = populateDailyScheduleTable(
                            prevTable,
                            selectedDate,
                            response.data,
                            settings?.fromHour ?? 1,
                            settings?.toHour ?? 10,
                            teachers || [],
                            classes || [],
                            subjects || []
                        );
                        return newSchedule || prevTable;
                    });
                }
            }
            return false;
        }
    };

    const rebalanceColumns = async (sortedColumnIds: string[], schedule: DailySchedule) => {
        if (!school?.id) return;

        const updates: { columnId: string; position: number }[] = [];

        setMainDailyTable(prev => {
            const newSchedule = { ...prev };
            // Create a shallow copy of the day's schedule to avoid mutating the original
            if (newSchedule[selectedDate]) {
                newSchedule[selectedDate] = { ...newSchedule[selectedDate] };
            } else {
                newSchedule[selectedDate] = {};
            }

            sortedColumnIds.forEach((colId, index) => {
                const newPos = (index + 1) * POSITION_GAP;

                // Optimization: Only send update to DB if position actually changes
                const currentColumn = schedule[selectedDate]?.[colId];
                const currentPos = currentColumn?.["1"]?.headerCol?.position || 0;

                if (currentPos !== newPos) {
                    updates.push({ columnId: colId, position: newPos });
                }

                // Update local state immediately
                updateColumnPositionInSchedule(newSchedule[selectedDate], colId, newPos);
            });

            return newSchedule;
        });

        try {
            const { updateDailyColumnPositionsAction } = await import("@/app/actions/PUT/updateDailyColumnPositionsAction");
            await updateDailyColumnPositionsAction(school.id, selectedDate, updates);
        } catch (error) {
            logErrorAction({ description: `Error rebalancing columns: ${error instanceof Error ? error.message : String(error)}`, schoolId: school?.id });
        }
    };

    const addNewEmptyColumn = (type: ColumnType) => {
        const schedule = mainDailyTable[selectedDate] || {};
        const existingColumns = Object.keys(schedule);

        if (!validateMaxColumns(existingColumns.length)) return;

        const newColumnId = generateId();
        const sortedColumns = sortDailyColumnIdsByPosition(existingColumns, schedule);

        const newPriority = COLUMN_PRIORITY[type];

        // Logic: Insert AFTER the last column that has equal or higher priority (lower priority value).
        // Priority:Red(0) < Green(1) < Blue(2)
        let insertAfterIndex = -1;

        for (let i = 0; i < sortedColumns.length; i++) {
            const colId = sortedColumns[i];
            const colType = schedule[colId]?.["1"]?.headerCol?.type ?? ColumnTypeValues.existingTeacher;
            const colPriority = COLUMN_PRIORITY[colType] ?? 1;

            if (colPriority <= newPriority) {
                insertAfterIndex = i;
            }
        }

        // Calculate Position
        const prevId = insertAfterIndex >= 0 ? sortedColumns[insertAfterIndex] : null;
        const nextId = insertAfterIndex + 1 < sortedColumns.length ? sortedColumns[insertAfterIndex + 1] : null;

        const prevPos = prevId ? (schedule[prevId]?.["1"]?.headerCol?.position || 0) : 0;
        // If nextId is null, it means we are inserting at the very end.
        // In this case, nextPos should be prevPos + 2*POSITION_GAP to ensure a gap.
        const nextPos = nextId ? (schedule[nextId]?.["1"]?.headerCol?.position || ((prevPos || 0) + POSITION_GAP * 2)) : ((prevPos || 0) + POSITION_GAP * 2);

        const calculatedNewPos = Math.floor((prevPos + nextPos) / 2);

        // Check collision or creation of 0-gap
        // If newPos is equal to prevPos or nextPos, or if inserting at the start and nextPos is too small (e.g., 0 or 1),
        // it indicates a need for rebalancing.
        if (calculatedNewPos === prevPos || calculatedNewPos === nextPos || (insertAfterIndex === -1 && calculatedNewPos < REBALANCE_THRESHOLD)) {
            // Rebalance everything including the new column
            const newColsList = [...sortedColumns];
            // insertAfterIndex is where we insert AFTER. So we insert AT insertAfterIndex + 1.
            const spliceIndex = insertAfterIndex + 1;
            newColsList.splice(spliceIndex, 0, newColumnId);

            // Create a copy for mutation
            const tempSchedule = { ...mainDailyTable };
            if (tempSchedule[selectedDate]) {
                tempSchedule[selectedDate] = { ...tempSchedule[selectedDate] };
            } else {
                tempSchedule[selectedDate] = {};
            }

            // Create empty column first with placeholder pos
            const scheduleWithNewCol = initializeEmptyColumn(
                tempSchedule,
                selectedDate,
                newColumnId,
                { type, position: 0 }, // Placeholder position, will be updated by rebalance
                settings?.fromHour ?? 1,
                settings?.toHour ?? 10
            );

            // Pass this schedule to rebalance so it knows about the new column
            rebalanceColumns(newColsList, scheduleWithNewCol);
            return;
        }

        // Normal Insert
        // Create a copy for mutation
        const finalSchedule = { ...mainDailyTable };
        if (finalSchedule[selectedDate]) {
            finalSchedule[selectedDate] = { ...finalSchedule[selectedDate] };
        } else {
            finalSchedule[selectedDate] = {};
        }

        const newSchedule = initializeEmptyColumn(
            finalSchedule,
            selectedDate,
            newColumnId,
            { type, position: calculatedNewPos },
            settings?.fromHour ?? 1,
            settings?.toHour ?? 10
        );

        setMainDailyTable(prev => ({ ...prev, ...newSchedule }));
    };

    const moveColumn = async (columnId: string, direction: "left" | "right") => {
        if (!school?.id) return;
        const schedule = mainDailyTable[selectedDate] || {};
        const columnIds = Object.keys(schedule);
        const sortedCols = sortDailyColumnIdsByPosition(columnIds, schedule);

        const currentIndex = sortedCols.indexOf(columnId);
        if (currentIndex === -1) return;

        const targetIndex = direction === "right" ? currentIndex - 1 : currentIndex + 1;

        if (targetIndex < 0 || targetIndex >= sortedCols.length) return;

        const targetColumnId = sortedCols[targetIndex];
        const currentColumn = schedule[columnId];
        const targetColumn = schedule[targetColumnId];

        // Get current positions
        const currentPos = currentColumn?.["1"]?.headerCol?.position || 0;
        const targetPos = targetColumn?.["1"]?.headerCol?.position || 0;

        // Perform swap
        const updates = [
            { columnId: columnId, position: targetPos },
            { columnId: targetColumnId, position: currentPos },
        ];

        // Optimistic update
        setMainDailyTable(prev => {
            const newSchedule = { ...prev };
            if (newSchedule[selectedDate]) {
                newSchedule[selectedDate] = { ...newSchedule[selectedDate] };

                // Update current column
                updateColumnPositionInSchedule(newSchedule[selectedDate], columnId, targetPos);

                // Update target column
                updateColumnPositionInSchedule(newSchedule[selectedDate], targetColumnId, currentPos);
            }
            return newSchedule;
        });

        try {
            const { updateDailyColumnPositionsAction } = await import(
                "@/app/actions/PUT/updateDailyColumnPositionsAction"
            );
            await updateDailyColumnPositionsAction(school.id, selectedDate, updates);
        } catch (error) {
            logErrorAction({ description: `Error moving column: ${error instanceof Error ? error.message : String(error)}`, schoolId: school?.id });
            // Revert state on error if needed or refetch
        }
    };

    return (
        <DailyTableContext.Provider
            value={{
                selectedDate,
                mainDailyTable,
                isLoading,
                isPreviewMode,
                mapAvailableTeachers,
                teacherClassMap,
                systemRecommendations,
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
                togglePreviewMode,
                moveColumn,

                pasteEventColumn,
            }}
        >
            {children}
        </DailyTableContext.Provider>
    );
};