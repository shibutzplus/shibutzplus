"use client";

import React from "react";
import styles from "./HistoryTopActions.module.css";
import DynamicInputSelect from "@/components/ui/select/InputSelect/DynamicInputSelect";
import { useHistoryTable } from "@/context/HistoryTableContext";
import { HistoryMonthOptions } from "@/resources/historyOptions";

const HistoryTopActions: React.FC = () => {
    const { selectedMonth, selectedDay, dayOptions, handleMonthChange, handleDayChange } =
        useHistoryTable();

    return (
        <section className={styles.actionsContainer}>
            <div className={`${styles.selectContainer} ${styles.monthSelect}`}>
                <DynamicInputSelect
                    options={HistoryMonthOptions}
                    value={selectedMonth}
                    onChange={handleMonthChange}
                    isSearchable={false}
                    placeholder="בחר חודש"
                    hasBorder
                />
            </div>
            /
            <div className={`${styles.selectContainer} ${styles.daySelect}`}>
                <DynamicInputSelect
                    options={dayOptions}
                    value={selectedDay}
                    onChange={handleDayChange}
                    isSearchable={false}
                    placeholder="בחר יום"
                    hasBorder
                />
            </div>
        </section>
    );
};

export default HistoryTopActions;
