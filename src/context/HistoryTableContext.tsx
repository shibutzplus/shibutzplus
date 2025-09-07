"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { SelectOption } from "@/models/types";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

type Ctx = {
    selectedYearDate: string;
    selectedYear: string;
    selectedMonth: string; // "1".."12"
    selectedDay: string;   // "1".."31"
    yearOptions: SelectOption[];
    monthOptions: SelectOption[];
    dayOptions: SelectOption[];
    handleYearChange: (val: string) => void;
    handleMonthChange: (val: string) => void;
    handleDayChange: (val: string) => void;
};

const HistoryTableContext = createContext<Ctx | null>(null);
export const useHistoryTable = () => {
    const ctx = useContext(HistoryTableContext);
    if (!ctx) throw new Error("useHistoryTable must be used within HistoryTableProvider");
    return ctx;
};

// Hebrew month labels excluding July and August
const monthOptionsStatic: SelectOption[] = [
    { value: "9", label: "ספטמבר" },
    { value: "10", label: "אוקטובר" },
    { value: "11", label: "נובמבר" },
    { value: "12", label: "דצמבר" },
    { value: "1", label: "ינואר" },
    { value: "2", label: "פברואר" },
    { value: "3", label: "מרץ" },
    { value: "4", label: "אפריל" },
    { value: "5", label: "מאי" },
    { value: "6", label: "יוני" },
];

function pad2(n: number) {
    return n < 10 ? `0${n}` : `${n}`;
}
function daysInMonth(year: number, month1to12: number) {
    return new Date(year, month1to12, 0).getDate();
}
function isYYYYMMDD(s: string) {
    return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

export const HistoryTableProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const dateQ = searchParams.get("date"); // YYYY-MM-DD or null

    // default yesterday
    const now = new Date();
    const yday = new Date(now);
    yday.setDate(now.getDate() - 1);

    const currentYear = `${yday.getFullYear()}`;
    const ydayMonth = yday.getMonth() + 1; // 1..12
    const ydayDay = yday.getDate();

    // if yesterday is in July or August, fallback to September
    const initialMonth = ydayMonth === 7 || ydayMonth === 8 ? "9" : `${ydayMonth}`;

    // derive initial state from ?date= if valid; otherwise fall back to defaults
    const fromQuery = dateQ && isYYYYMMDD(dateQ) ? dateQ : null;
    const qYear = fromQuery ? fromQuery.slice(0, 4) : undefined;
    const qMonth = fromQuery ? String(parseInt(fromQuery.slice(5, 7), 10)) : undefined; // "1".."12"
    const qDay = fromQuery ? String(parseInt(fromQuery.slice(8, 10), 10)) : undefined; // "1".."31"

    const [selectedYear, setSelectedYear] = useState<string>(qYear || currentYear);
    const [selectedMonth, setSelectedMonth] = useState<string>(qMonth || initialMonth);
    const [selectedDay, setSelectedDay] = useState<string>(qDay || `${ydayDay}`);

    const yearOptions: SelectOption[] = useMemo(
        () => [{ value: currentYear, label: currentYear }],
        [currentYear]
    );

    const monthOptions = monthOptionsStatic;

    const [dayOptions, setDayOptions] = useState<SelectOption[]>([]);

    // rebuild day options when year/month changes
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
    }, [selectedYear, selectedMonth]);

    // keep context in sync if ?date= changes
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

    // reflect selectedYearDate into the URL (?date=YYYY-MM-DD)
    useEffect(() => {
        const currentQ = searchParams.get("date");
        if (selectedYearDate && currentQ !== selectedYearDate) {
            const next = new URLSearchParams(searchParams.toString());
            next.set("date", selectedYearDate);
            router.replace(`${pathname}?${next.toString()}`);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedYearDate]);

    // public API
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
                monthOptions,
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
