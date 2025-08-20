"use client";

import React from "react";
import styles from "./HistoryTopActions.module.css";
import DynamicInputSelect from "@/components/ui/InputSelect/DynamicInputSelect";
import { useHistoryTable } from "@/context/HistoryTableContext";

const HistoryTopActions: React.FC = () => {
    const { selectedYearDate, yearDaysSelectOptions, handleYearDayChange } = useHistoryTable();

    return (
        <section className={styles.actionsContainer}>
            <DynamicInputSelect
                options={yearDaysSelectOptions()}
                value={selectedYearDate}
                onChange={handleYearDayChange}
                isSearchable={false}
                placeholder="בחר תאריך..."
                hasBorder
            />
        </section>
    );
};

export default HistoryTopActions;
