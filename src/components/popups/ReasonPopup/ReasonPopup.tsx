"use client";

import React, { useState } from "react";
import styles from "./ReasonPopup.module.css";
import DynamicInputSelect from "@/components/ui/select/InputSelect/DynamicInputSelect";
import { reasonSchema } from "@/models/validation/reason";
import { SelectOption } from "@/models/types";

const REASON_OPTIONS: SelectOption[] = [
    { value: "מחלה", label: "מחלה" },
    { value: "מחלת ילד", label: "מחלת ילד" },
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
    const [reason, setReason] = useState(initialReason);
    const [error, setError] = useState("");

    const handleConfirm = () => {
        const trimmed = reason.trim();
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

    const handleChange = (value: string) => {
        setReason(value);
        if (error) setError("");
    };

    return (
        <div className={styles.popupContent} onMouseDown={(e) => e.stopPropagation()}>
            <div className={styles.title}>סיבת היעדרות</div>

            <div className={styles.inputContainer}>
                <DynamicInputSelect
                    options={REASON_OPTIONS}
                    value={reason}
                    onChange={handleChange}
                    placeholder="בחירה או הקלדה חופשית"
                    isSearchable
                    isCreatable
                    isClearable
                    hasBorder
                    formatCreateLabel={(inputValue) => `"${inputValue}"`}
                    menuPortalTarget={null}
                />
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
