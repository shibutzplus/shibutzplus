"use client";
import React from "react";
import { ActionColumnType } from "@/models/types/table";
import styles from "./ActionBar.module.css";
interface ActionBarProps {
    onSelect: (type: ActionColumnType) => void;
    onDelete: () => void;
}
const actions: {
    key?: ActionColumnType;
    isDelete?: boolean;
    label: string;
    dotClass: string;
    disabled: boolean;
}[] = [
    { label: "פרסום", dotClass: styles.publish, disabled: true },
    { label: "היסטוריה", dotClass: styles.history, disabled: true },
    { key: "missingTeacher", label: "מורה חסר", dotClass: styles.missingTeacher, disabled: false },
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

export const ActionBar: React.FC<ActionBarProps> = ({ onSelect, onDelete }) => (
    <aside className={styles.container}>
        <h2>פעולות</h2>
        <ul className={styles.list}>
            {actions.map((act, i) => (
                <li
                    key={i}
                    className={`${styles.item} ${act.disabled ? styles.disabled : ""}`}
                    onClick={() => {
                        if (act.disabled) return;
                        if (act.isDelete) onDelete();
                        else if (act.key) onSelect(act.key);
                    }}
                >
                    <span className={`${styles.dot} ${act.dotClass}`} />
                    {act.label}
                </li>
            ))}
        </ul>
    </aside>
);
