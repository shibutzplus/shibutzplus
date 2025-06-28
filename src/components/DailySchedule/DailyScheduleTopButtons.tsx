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
            <button
                className={`${styles.topButton} ${styles.teacherButton}`}
                onClick={() => {
                    if (actions[2].disabled) return;
                    if (actions[2].isDelete) dispatch({ type: "REMOVE_COL" });
                    else if (actions[2].key) dispatch({ type: "ADD_COL", colType: actions[2].key });
                }}
                title={actions[2].label}
            >
                <FaPlus className={styles.buttonIcon} />
                <span>{actions[2].label}</span>
            </button>
            <button
                className={`${styles.topButton} ${styles.infoButton}`}
                onClick={() => {
                    if (actions[3].disabled) return;
                    if (actions[3].isDelete) dispatch({ type: "REMOVE_COL" });
                    else if (actions[3].key) dispatch({ type: "ADD_COL", colType: actions[3].key });
                }}
                title={actions[3].label}
            >
                <FaPlus className={styles.buttonIcon} />
                <span>{actions[3].label}</span>
            </button>
            <button
                className={`${styles.topButton} ${styles.missingButton}`}
                onClick={() => {
                    if (actions[4].disabled) return;
                    if (actions[4].isDelete) dispatch({ type: "REMOVE_COL" });
                    else if (actions[4].key) dispatch({ type: "ADD_COL", colType: actions[4].key });
                }}
                title={actions[4].label}
            >
                <FaPlus className={styles.buttonIcon} />
                <span>{actions[4].label}</span>
            </button>
        </div>
    );
};

export default DailyScheduleTopButtons;
