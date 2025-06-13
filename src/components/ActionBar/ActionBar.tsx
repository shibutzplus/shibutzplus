"use client";

import React from "react";
import { ActionColumnType } from "@/models/types/table";
import styles from "./ActionBar.module.css";
import { useTable } from "@/context/TableContext";

export const ActionBar: React.FC = () => {
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
        <aside className={styles.container}>
            <h2>פעולות</h2>
            <ul className={styles.list}>
                {actions.map((act, i) => (
                    <li
                        key={i}
                        className={`${styles.item} ${act.disabled ? styles.disabled : ""}`}
                        onClick={() => {
                            if (act.disabled) return;
                            if (act.isDelete) dispatch({ type: "REMOVE_COL" });
                            else if (act.key) dispatch({ type: "ADD_COL", colType: act.key });
                        }}
                    >
                        <span className={`${styles.dot} ${act.dotClass}`} />
                        {act.label}
                    </li>
                ))}
            </ul>
        </aside>
    );
};
