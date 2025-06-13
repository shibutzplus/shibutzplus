"use client";
import React from "react";
import { ActionColumnType } from "@/models/types/table";
interface ActionBarProps {
    onSelect: (type: ActionColumnType) => void;
    onDelete: () => void;
}

const allActions: {
    key?: ActionColumnType;
    isDelete?: boolean;
    label: string;
    disabled: boolean;
}[] = [
    { label: "פרסום", disabled: true },
    { label: "היסטוריה", disabled: true },
    { key: "missingTeacher", label: "מורה חסר", disabled: false },
    { key: "existingTeacher", label: "מורה קיים", disabled: false },
    { key: "info", label: "מידע", disabled: false },
    { isDelete: true, label: "מחיקה", disabled: false },
    { label: "עדכון", disabled: true },
    { label: "הזזה", disabled: true },
];

export const ActionBar: React.FC<ActionBarProps> = ({ onSelect, onDelete }) => (
    <div
        style={{
            width: 100,
            background: "#f9f9f9",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: 8,
        }}
    >
        {allActions.map((act, idx) => (
            <button
                key={idx}
                disabled={act.disabled}
                onClick={() => {
                    if (act.isDelete) onDelete();
                    else if (act.key) onSelect(act.key);
                }}
                style={{
                    margin: "4px 0",
                    width: "90%",
                    padding: "6px",
                    cursor: act.disabled ? "not-allowed" : "pointer",
                    opacity: act.disabled ? 0.5 : 1,
                }}
            >
                {act.label}
            </button>
        ))}
    </div>
);
