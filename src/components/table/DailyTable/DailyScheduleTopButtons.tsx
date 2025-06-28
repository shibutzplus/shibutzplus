import React from "react";
import styles from "./dailySchedule.module.css";
import { FaPlus } from "react-icons/fa";
import { useTable } from "@/context/TableContext";
import { ActionColumnType } from "@/models/types/table";

/**
 * Component for the top buttons in the daily schedule
 * Each button adds a new column to the schedule with specific input types and colors
 */
const DailyScheduleTopButtons: React.FC = () => {
    const { dispatch } = useTable();

    const actions: {
        key?: ActionColumnType;
        isDelete?: boolean;
        label: string;
        dotClass: string;
        disabled: boolean;
    }[] = [
        { label: "פרסום", dotClass: styles.publish, disabled: true },
        { label: "היסטוריה", dotClass: styles.history, disabled: true },
        {
            key: "missingTeacher",
            label: "מורה חסר",
            dotClass: styles.missingTeacher,
            disabled: false,
        },
        {
            key: "existingTeacher",
            label: "מורה קיים",
            dotClass: styles.existingTeacher,
            disabled: false,
        },
        { key: "info", label: "מידע", dotClass: styles.info, disabled: false },
        { isDelete: true, label: "מחיקה", dotClass: styles.delete, disabled: false },
        { label: "עדכון", dotClass: styles.update, disabled: true },
        { label: "הזזה", dotClass: styles.move, disabled: true },
    ];

    return (
        <div className={styles.topButtonsContainer}>
            {actions.map((act, i) => (
                <button
                    key={i}
                    className={`${styles.topButton} ${act.dotClass} ${act.disabled ? styles.disabled : ""}`}
                    title={act.label}
                    disabled={act.disabled}
                    onClick={() => {
                        if (act.disabled) return;
                        if (act.isDelete) dispatch({ type: "REMOVE_COL" });
                        else if (act.key) dispatch({ type: "ADD_COL", colType: act.key });
                    }}
                >
                    <FaPlus className={styles.buttonIcon} />
                    <span>{act.label}</span>
                </button>
            ))}
        </div>
    );
};

export default DailyScheduleTopButtons;
