"use client";

import React from "react";
import styles from "./DailyTableTopBtns.module.css";
import { useDailyTableContext } from "@/context/DailyTableContext";
import { tableActions } from "@/resources/tableActions";

/**
 * Component for the top buttons in the daily schedule
 * Each button adds a new column to the schedule with specific input types and colors
 */
const DailyTableTopBtns: React.FC = () => {
    const { addNewColumn } = useDailyTableContext();
    return (
        <div className={styles.topButtonsContainer}>
            {tableActions.map((act, i) => (
                <button
                    key={i}
                    style={act.style}
                    className={`${styles.topButton} ${act.disabled ? styles.disabled : ""}`}
                    title={act.label}
                    disabled={act.disabled}
                    onClick={() => {
                        if (act.disabled) return;
                        if (act.key) addNewColumn(act.key);
                    }}
                >
                    {act.Icon}
                    <span>{act.label}</span>
                </button>
            ))}
        </div>
    );
};

export default DailyTableTopBtns;
