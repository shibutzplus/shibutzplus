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
import { AvailableTeachers } from "@/models/types/annualSchedule";
import { getTomorrowOption } from "@/resources/dayOptions";
import { getDailyScheduleAction } from "@/app/actions/GET/getDailyScheduleAction";
import { infoToast } from "@/lib/toast";
import { generateId } from "@/utils";
import { deleteDailyColumnAction } from "@/app/actions/DELETE/deleteDailyColumnAction";
import useDailyEventActions from "@/hooks/daily/useDailyEventActions";
import { mapAnnualTeachers, populateDailyScheduleTable } from "@/services/daily/populate";
import { createNewEmptyColumn } from "@/services/daily/setEmpty";

interface DailyTableContextType {
    mainDailyTable: DailySchedule;
    mapAvailableTeachers: AvailableTeachers;
    isLoading: boolean;
    isEditMode: boolean;
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
    const { school, teachers } = useMainContext();

    // Main state for table object storage
    const [mainDailyTable, setMainDailyTable] = useState<DailySchedule>({});
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [mapAvailableTeachers, setMapAvailableTeachers] = useState<AvailableTeachers>({});

    const [isEditMode, setEditMode] = useState<boolean>(true);
    const changeDailyMode = () => setEditMode((prev) => !prev);

    // Select Date
    const { daysSelectOptions, selectedDate, handleDayChange } = useDailySelectedDate();

    const setMainAndStorageTable = (newSchedule: DailySchedule) => {
        setMainDailyTable({ ...newSchedule });
        setSessionDailyTable(newSchedule, selectedDate);
    };

    const clearColumn = (day: string, columnId: string) => {
        const updatedSchedule = { ...mainDailyTable };

        if (updatedSchedule[day] && updatedSchedule[day][columnId]) {
            updatedSchedule[day][columnId] = {};
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
                    setMapAvailableTeachers(teacherMapping);
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
                if (response.success && response.data && teachers) {
                    const newSchedule = await populateDailyScheduleTable(
                        mainDailyTable,
                        selectedDate,
                        response.data,
                    );
                    if (newSchedule) setMainAndStorageTable(newSchedule);
                } else {
                    infoToast("החיבור למשתמש נותק, יש להיכנס מחדש למערכת.");
                }
            } catch (error) {
                console.error("Error fetching daily schedule data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDataForDate();
    }, [school?.id, selectedDate]);

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

    const addNewEmptyColumn = (type: ColumnType) => {
        const newColumnId = `${type}-${generateId()}`;
        const updatedSchedule = createNewEmptyColumn(
            mainDailyTable,
            selectedDate,
            newColumnId,
            type,
        );
        setMainAndStorageTable(updatedSchedule);
    };

    const deleteColumn = async (columnId: string) => {
        if (!school?.id) return false;
        const prevSchedule = { ...mainDailyTable };

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
            setMainAndStorageTable(prevSchedule);
            console.error("Error deleting daily column:", error);
            return false;
        }
    };

    return (
        <DailyTableContext.Provider
            value={{
                selectedDate,
                mainDailyTable,
                isLoading,
                isEditMode,
                mapAvailableTeachers,
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
            }}
        >
            {children}
        </DailyTableContext.Provider>
    );
};
