"use client";

import React, { useMemo, ChangeEvent } from "react";
import styles from "./HistoryTopActions.module.css";
import { useHistoryTable } from "@/context/HistoryTableContext";

const HistoryTopActions: React.FC = () => {
    const { selectedMonth, selectedDay, handleMonthChange, handleDayChange, } = useHistoryTable();

    // Build YYYY-MM-DD for the <input type="date"> value
    const inputValue = useMemo(() => {
        const now = new Date();
        const year = now.getFullYear();
        const monthStr = String(selectedMonth ?? now.getMonth() + 1).padStart(2, "0");
        const dayStr = String(selectedDay ?? now.getDate()).padStart(2, "0");
        return `${year}-${monthStr}-${dayStr}`;
    }, [selectedMonth, selectedDay]);

    // Split the picked date and push month/day into the existing handlers
    const onDateChange = (e: ChangeEvent<HTMLInputElement>) => {
        const iso = e.target.value; // YYYY-MM-DD
        if (!iso) return;
        const [, m, d] = iso.split("-");
        handleMonthChange(String(Number(m))); // "09" -> "9"
        handleDayChange(String(Number(d)));   // "02" -> "2"
    };

    return (
        <section className={styles.actionsContainer}>
            <input
                id="history-date"
                name="history-date"
                type="date"
                className={styles.dateInput}
                value={inputValue}
                onChange={onDateChange}
            />
        </section>

    );
};

export default HistoryTopActions;
