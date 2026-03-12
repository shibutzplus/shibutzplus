"use client";

import React, { useState } from "react";
import styles from "./ReasonPopup.module.css";
import { reasonSchema } from "@/models/validation/reason";
import { SelectOption } from "@/models/types";

const REASON_OPTIONS: SelectOption[] = [
    { value: "מחלה", label: "מחלה" },
    { value: "מחלת ילד", label: "מחלת ילד" },
    { value: "בדיקות", label: "בדיקות" },
    { value: "מילואים", label: "מילואים" },
    { value: "יום בחירה", label: "יום בחירה" },
];

interface ReasonPopupProps {
    initialReason?: string;
    onConfirm: (reason: string) => void;
    onCancel: () => void;
}

const ReasonPopup: React.FC<ReasonPopupProps> = ({
    initialReason = "",
    onConfirm,
    onCancel,
}) => {
    // Check if initialReason is in predefined options
    const isPredefined = REASON_OPTIONS.some(opt => opt.value === initialReason);
    const initialSelectValue = initialReason === "" ? "" : (isPredefined ? initialReason : "other");
    const initialCustomValue = isPredefined ? "" : initialReason;

    const [selectValue, setSelectValue] = useState(initialSelectValue);
    const [customReason, setCustomReason] = useState(initialCustomValue);
    const [error, setError] = useState("");

    const handleConfirm = () => {
        const finalReason = selectValue === "other" ? customReason : selectValue;
        const trimmed = finalReason.trim();
        if (!trimmed) {
            onConfirm("");
            return;
        }

        const parsed = reasonSchema.safeParse(trimmed);
        if (!parsed.success) {
            setError(parsed.error.issues[0]?.message || "סיבה לא תקינה");
            return;
        }

        onConfirm(parsed.data);
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        setSelectValue(val);
        if (val !== "other") {
            setCustomReason("");
        }
        if (error) setError("");
    };

    const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCustomReason(e.target.value);
        if (error) setError("");
    };

    return (
        <div className={styles.popupContent} onMouseDown={(e) => e.stopPropagation()}>
            <div className={styles.title}>סיבת היעדרות</div>

            <div className={styles.inputContainer}>
                <select
                    className={styles.nativeSelect}
                    value={selectValue}
                    onChange={handleSelectChange}
                >
                    <option value="">ללא סיבה...</option>
                    {REASON_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                    <option value="other">אחר...</option>
                </select>

                {selectValue === "other" && (
                    <input
                        type="text"
                        className={styles.customInput}
                        value={customReason}
                        onChange={handleCustomChange}
                        placeholder="הקלדת סיבה..."
                        maxLength={20}
                        autoFocus
                    />
                )}
                {error && <div className={styles.errorMessage}>{error}</div>}
            </div>

            <div className={styles.buttonContainer}>
                <button
                    className={styles.confirmButton}
                    onClick={handleConfirm}
                >
                    אישור
                </button>
                <button
                    className={styles.cancelButton}
                    onClick={onCancel}
                >
                    ביטול
                </button>
            </div>
        </div>
    );
};

export default ReasonPopup;
