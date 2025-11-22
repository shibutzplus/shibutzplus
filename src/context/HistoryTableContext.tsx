"use client";

import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { SelectOption } from "@/models/types";
import {
    isYYYYMMDD,
    getCurrentDateComponents,
    parseDateString,
    buildDateString,
    getTodayString,
    getSchoolYearInitialMonth,
    generateDayOptions,
    clampDayToMonth,
} from "@/utils/time";
import { useQueryParam } from "@/hooks/useQueryParam";
import { DailySchedule, DailyScheduleType } from "@/models/types/dailySchedule";
import { useMainContext } from "./MainContext";
import { getDailyScheduleAction } from "@/app/actions/GET/getDailyScheduleAction";
import { populateTable, setColumn, setEmptyColumn } from "@/services/dailyScheduleService";
import { infoToast } from "@/lib/toast";

interface HistoryTableContextType {
    selectedYearDate: string;
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
    const { school, teachers } = useMainContext();
    const { getDateQ, setDateQ } = useQueryParam();
    const dateQ = getDateQ(); // YYYY-MM-DD or empty string

    const { year: currentYear, month: currentMonth, day: currentDay } = getCurrentDateComponents();
    const initialMonth = getSchoolYearInitialMonth();
    const todayStr = getTodayString();

    // Ensure URL has a valid ?date on first loads and when invalid values appear
    useEffect(() => {
        if (!dateQ || !isYYYYMMDD(dateQ)) {
            setDateQ(todayStr);
        }
    }, []);

    // derive initial state from ?date= if valid; otherwise fall back to defaults
    const parsedDate = dateQ && isYYYYMMDD(dateQ) ? parseDateString(dateQ) : null;

    const [selectedYear, setSelectedYear] = useState<string>(parsedDate?.year || currentYear);
    const [selectedMonth, setSelectedMonth] = useState<string>(parsedDate?.month || initialMonth);
    const [selectedDay, setSelectedDay] = useState<string>(parsedDate?.day || currentDay);

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

    // Keep context in sync if ?date= changes (URL -> state)
    useEffect(() => {
        if (!parsedDate) return;
        setSelectedYear(parsedDate.year);
        setSelectedMonth(parsedDate.month);
        setSelectedDay(parsedDate.day);
    }, [dateQ]);

    const selectedYearDate = useMemo(() => {
        return buildDateString(selectedYear, selectedMonth, selectedDay);
    }, [selectedYear, selectedMonth, selectedDay]);

    // Reflect selectedYearDate into the URL (?date=YYYY-MM-DD) (state -> URL)
    useEffect(() => {
        const currentQ = getDateQ();
        if (selectedYearDate && currentQ !== selectedYearDate) {
            setDateQ(selectedYearDate);
        }
    }, [selectedYearDate]);

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
                if (response.success && response.data && teachers) {
                    populateDailyScheduleTable(response.data);
                } else {
                    // infoToast("החיבור למשתמש נותק, יש להיכנס מחדש למערכת.");
                    setMainDailyTable({});
                }
            } catch (error) {
                console.error("Error fetching daily schedule data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDataForDate();
    }, [school?.id, selectedYearDate, teachers]);

    const populateDailyScheduleTable = async (dataColumns: DailyScheduleType[]) => {
        try {
            if (!dataColumns) return;
            if (dataColumns.length === 0) {
                setMainDailyTable(setEmptyColumn({}, selectedYearDate));
                return;
            }

            const { entriesByDayAndHeader } = populateTable(dataColumns, selectedYearDate);

            // Populate all schedule data at once
            const newSchedule: DailySchedule = {};
            Object.entries(entriesByDayAndHeader).forEach(([date, headerEntries]) => {
                Object.entries(headerEntries).forEach(([columnId, cells]) => {
                    setColumn(cells, newSchedule, columnId, date);
                });
            });

            setMainDailyTable(newSchedule);
        } catch (error) {
            console.error("Error processing daily schedule data:", error);
        }
    };

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
