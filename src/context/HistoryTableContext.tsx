"use client";

import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { SelectOption } from "@/models/types";
import {
    getCurrentDateComponents,
    buildDateString,
    generateDayOptions,
    clampDayToMonth,
} from "@/utils/time";
import { DailySchedule } from "@/models/types/dailySchedule";
import { useMainContext } from "./MainContext";
import { getDailyScheduleAction } from "@/app/actions/GET/getDailyScheduleAction";
import { populateDailyScheduleTable } from "@/services/daily/populate";
import { errorToast } from "@/lib/toast";

interface HistoryTableContextType {
    selectedYearDate: string; // YYYY-MM-DD format (same as daily context)
    selectedYear: string;
    selectedMonth: string; // "1".."12"
    selectedDay: string; // "1".."31"
    yearOptions: SelectOption[];
    dayOptions: SelectOption[];
    handleYearChange: (val: string) => void;
    handleMonthChange: (val: string) => void;
    handleDayChange: (val: string) => void;
    mainDailyTable: DailySchedule;
    isLoading: boolean;
}

const HistoryTableContext = createContext<HistoryTableContextType | undefined>(undefined);

export const useHistoryTable = () => {
    const context = useContext(HistoryTableContext);
    if (!context) throw new Error("useHistoryTable must be used within HistoryTableProvider");
    return context;
};

interface HistoryTableProviderProps {
    children: ReactNode;
}

export const HistoryTableProvider: React.FC<HistoryTableProviderProps> = ({ children }) => {
    const { school } = useMainContext();
    const { year: currentYear, month: currentMonth, day: currentDay } = getCurrentDateComponents();

    const [selectedYear, setSelectedYear] = useState<string>(currentYear);
    const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);
    const [selectedDay, setSelectedDay] = useState<string>(currentDay);

    const [mainDailyTable, setMainDailyTable] = useState<DailySchedule>({});
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const [dayOptions, setDayOptions] = useState<SelectOption[]>([]);

    const yearOptions: SelectOption[] = useMemo(
        () => [{ value: currentYear, label: currentYear }],
        [currentYear],
    );

    useEffect(() => {
        // Rebuild day options when year/month changes
        const opts = generateDayOptions(selectedYear, selectedMonth);
        setDayOptions(opts);
        const clampedDay = clampDayToMonth(selectedDay, selectedYear, selectedMonth);
        if (clampedDay !== selectedDay) setSelectedDay(clampedDay);
    }, [selectedYear, selectedMonth, selectedDay]);

    const selectedYearDate = useMemo(() => {
        return buildDateString(selectedYear, selectedMonth, selectedDay);
    }, [selectedYear, selectedMonth, selectedDay]);

    const handleYearChange = (val: string) => setSelectedYear(val);
    const handleMonthChange = (val: string) => setSelectedMonth(val);
    const handleDayChange = (val: string) => setSelectedDay(val);

    // Fetch Daily rows by selected date and populate the table
    useEffect(() => {
        const fetchDataForDate = async () => {
            if (!school?.id || !selectedYearDate) return;
            try {
                setIsLoading(true);
                const response = await getDailyScheduleAction(school.id, selectedYearDate);
                if (response.success && response.data) {
                    const newSchedule = await populateDailyScheduleTable(
                        mainDailyTable,
                        selectedYearDate,
                        response.data,
                    );
                    if (newSchedule) setMainDailyTable(newSchedule);
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
    }, [school?.id, selectedYearDate]);

    return (
        <HistoryTableContext.Provider
            value={{
                selectedYearDate,
                selectedYear,
                selectedMonth,
                selectedDay,
                yearOptions,
                dayOptions,
                handleYearChange,
                handleMonthChange,
                handleDayChange,
                mainDailyTable,
                isLoading,
            }}
        >
            {children}
        </HistoryTableContext.Provider>
    );
};
