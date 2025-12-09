"use client";

import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { SelectOption } from "@/models/types";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { daysInMonth, isYYYYMMDD, pad2 } from "@/utils/time";

interface HistoryTableContextType {
    selectedYearDate: string;
    selectedYear: string;
    selectedMonth: string; // "1".."12"
    selectedDay: string;   // "1".."31"
    yearOptions: SelectOption[];
    dayOptions: SelectOption[];
    handleYearChange: (val: string) => void;
    handleMonthChange: (val: string) => void;
    handleDayChange: (val: string) => void;
};

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
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const dateQ = searchParams.get("date"); // YYYY-MM-DD or null

    const now = new Date();
    const tday = new Date(now);

    const currentYear = `${tday.getFullYear()}`;
    const tdayMonth = tday.getMonth() + 1; // 1..12
    const tdayDay = tday.getDate();

    // if yesterday is in July or August, fallback to September
    const initialMonth = tdayMonth === 7 || tdayMonth === 8 ? "9" : `${tdayMonth}`;

    // Helper: build today's date in YYYY-MM-DD
    const todayStr = `${tday.getFullYear()}-${pad2(tdayMonth)}-${pad2(tdayDay)}`;

    // Ensure URL has a valid ?date on first loads and when invalid values appear
    useEffect(() => {
        const q = searchParams.get("date");
        if (!q || !isYYYYMMDD(q)) {
            const next = new URLSearchParams(searchParams.toString());
            next.set("date", todayStr);
            router.replace(`${pathname}?${next.toString()}`);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname]); // run on mount / route change

    // derive initial state from ?date= if valid; otherwise fall back to defaults
    const fromQuery = dateQ && isYYYYMMDD(dateQ) ? dateQ : null;
    const qYear = fromQuery ? fromQuery.slice(0, 4) : undefined;
    const qMonth = fromQuery ? String(parseInt(fromQuery.slice(5, 7), 10)) : undefined; // "1".."12"
    const qDay = fromQuery ? String(parseInt(fromQuery.slice(8, 10), 10)) : undefined; // "1".."31"

    const [selectedYear, setSelectedYear] = useState<string>(qYear || currentYear);
    const [selectedMonth, setSelectedMonth] = useState<string>(qMonth || initialMonth);
    const [selectedDay, setSelectedDay] = useState<string>(qDay || `${tdayDay}`);

    const yearOptions: SelectOption[] = useMemo(
        () => [{ value: currentYear, label: currentYear }],
        [currentYear]
    );

    const [dayOptions, setDayOptions] = useState<SelectOption[]>([]);

    // Rebuild day options when year/month changes
    useEffect(() => {
        const yNum = parseInt(selectedYear, 10);
        const mNum = parseInt(selectedMonth, 10);
        const max = daysInMonth(yNum, mNum);
        const opts: SelectOption[] = Array.from({ length: max }, (_, i) => {
            const d = i + 1;
            return { value: `${d}`, label: `${d}` };
        });
        setDayOptions(opts);
        const dNum = parseInt(selectedDay, 10);
        if (dNum > max) setSelectedDay(`${max}`);
    }, [selectedYear, selectedMonth, selectedDay]);

    // Keep context in sync if ?date= changes (URL -> state)
    useEffect(() => {
        if (!fromQuery) return;
        setSelectedYear(qYear!);
        setSelectedMonth(qMonth!);
        setSelectedDay(qDay!);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dateQ]);

    const selectedYearDate = useMemo(() => {
        const yNum = parseInt(selectedYear, 10);
        const mNum = parseInt(selectedMonth, 10);
        const dNum = parseInt(selectedDay, 10);
        return `${yNum}-${pad2(mNum)}-${pad2(dNum)}`;
    }, [selectedYear, selectedMonth, selectedDay]);

    // Reflect selectedYearDate into the URL (?date=YYYY-MM-DD) (state -> URL)
    useEffect(() => {
        const currentQ = searchParams.get("date");
        if (selectedYearDate && currentQ !== selectedYearDate) {
            const next = new URLSearchParams(searchParams.toString());
            next.set("date", selectedYearDate);
            router.replace(`${pathname}?${next.toString()}`);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedYearDate]);

    const handleYearChange = (val: string) => setSelectedYear(val);
    const handleMonthChange = (val: string) => setSelectedMonth(val);
    const handleDayChange = (val: string) => setSelectedDay(val);

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
            }}
        >
            {children}
        </HistoryTableContext.Provider>
    );
};
