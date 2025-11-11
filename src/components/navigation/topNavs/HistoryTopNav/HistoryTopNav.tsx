"use client";

import TopNavLayout from "@/components/layout/TopNavLayout/TopNavLayout";
import router from "@/routes";
import styles from "./HistoryTopNav.module.css";
import { useHistoryTable } from "@/context/HistoryTableContext";
import { ChangeEvent, useMemo } from "react";

const HistoryTopNav: React.FC = () => {
    const { selectedMonth, selectedDay, handleMonthChange, handleDayChange } = useHistoryTable();

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
        handleDayChange(String(Number(d))); // "02" -> "2"
    };

    return (
        <TopNavLayout
            type="private"
            elements={{
                topRight: (
                    <div className={styles.rightContainer}>
                        <div>{router.annualSchedule.title}</div>
                        <div className={styles.selectClass}>
                            {/* TODO: move to a new component */}
                            <input
                                id="history-date"
                                name="history-date"
                                type="date"
                                className={styles.dateInput}
                                value={inputValue}
                                onChange={onDateChange}
                            />
                        </div>
                    </div>
                ),
            }}
        />
    );
};

export default HistoryTopNav;
