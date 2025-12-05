"use client";

import React, { ChangeEvent, useMemo } from "react";
import { useHistoryTable } from "@/context/HistoryTableContext";
import styles from "./InputDate.module.css";

const InputDate: React.FC = () => {
    const { selectedYear, selectedMonth, selectedDay, handleYearChange, handleMonthChange, handleDayChange } =
        useHistoryTable();

    // Build YYYY-MM-DD for the <input type="date"> value
    const inputValue = useMemo(() => {
        const now = new Date();
        const year = selectedYear || now.getFullYear();
        const monthStr = String(selectedMonth ?? now.getMonth() + 1).padStart(2, "0");
        const dayStr = String(selectedDay ?? now.getDate()).padStart(2, "0");
        return `${year}-${monthStr}-${dayStr}`;
    }, [selectedYear, selectedMonth, selectedDay]);

    // Split the picked date and push month/day into the existing handlers
    const onDateChange = (e: ChangeEvent<HTMLInputElement>) => {
        const iso = e.target.value; // YYYY-MM-DD
        if (!iso) return;
        const [y, m, d] = iso.split("-");
        handleYearChange(y);
        handleMonthChange(String(Number(m))); // "09" -> "9"
        handleDayChange(String(Number(d))); // "02" -> "2"
    };

    return (
        <input
            id="history-date"
            name="history-date"
            type="date"
            className={styles.dateInput}
            value={inputValue}
            onChange={onDateChange}
            onClick={(e) => {
                try {
                    e.currentTarget.showPicker();
                } catch (error) {
                    // Fallback or ignore if not supported
                }
            }}
        />
    );
};

export default InputDate;
