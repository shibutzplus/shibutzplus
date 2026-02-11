"use client";

import React, { useState } from "react";
import { usePopup } from "@/context/PopupContext";
import styles from "./SettingsPopup.module.css";
import { SelectOption } from "@/models/types";
import { updateSettingsAction } from "@/app/actions/PUT/updateSettingsAction";
import { errorToast } from "@/lib/toast";
import { SchoolSettingsType } from "@/models/types/settings";
import { DEFAULT_FROM_HOUR, DEFAULT_TO_HOUR } from "@/utils/time";
import Loading from "@/components/loading/Loading/Loading";

const fromHourOptions: SelectOption[] = [
    { value: "0", label: "0" },
    { value: "1", label: "1" },
];

const toHourOptions: SelectOption[] = Array.from({ length: 7 }, (_, i) => {
    const val = (i + 6).toString(); // 6 to 12
    return { value: val, label: val };
});

const externalTeacherOptions: SelectOption[] = [
    { value: "yes", label: "כן" },
    { value: "no", label: "לא" },
];


interface SettingsPopupProps {
    schoolId: string;
    initialFromHour?: number;
    initialToHour?: number;
    initialShowExternal: boolean;
    onSave: (settings: SchoolSettingsType) => void;
}

const SettingsPopup: React.FC<SettingsPopupProps> = ({
    schoolId,
    initialFromHour = DEFAULT_FROM_HOUR,
    initialToHour = DEFAULT_TO_HOUR,
    initialShowExternal,
    onSave,
}) => {
    const { closePopup } = usePopup();
    const [fromHour, setFromHour] = useState<string>(initialFromHour.toString());
    const [toHour, setToHour] = useState<string>(initialToHour.toString());
    const [showExternal, setShowExternal] = useState<string>(initialShowExternal ? "yes" : "no");
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!schoolId) {
            errorToast("שגיאה: לא נמצא מזהה בית ספר", Infinity);
            return;
        }

        setIsSaving(true);
        try {
            const from = parseInt(fromHour);
            const to = parseInt(toHour);

            const res = await updateSettingsAction({
                fromHour: from,
                toHour: to,
                displaySchedule2Susb: showExternal === "yes",
                schoolId: schoolId,
            });

            if (res.success) {
                if (res.data) {
                    onSave(res.data);
                }
                closePopup();
            } else {
                errorToast(res.message || "שגיאה בשמירת ההגדרות", Infinity);
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        if (isSaving) return;
        closePopup();
    };

    return (
        <div className={styles.popupContent}>
            <h2 className={styles.title}>הגדרות מערכת</h2>

            <div className={styles.inputsContainer}>
                <div style={{ display: "flex", gap: "10px" }}>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>שעת התחלה:</label>
                        <select
                            value={fromHour}
                            onChange={(e) => setFromHour(e.target.value)}
                            className={styles.selectInput}
                            disabled={isSaving}
                        >
                            {fromHourOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>שעת סיום:</label>
                        <select
                            value={toHour}
                            onChange={(e) => setToHour(e.target.value)}
                            className={styles.selectInput}
                            disabled={isSaving}
                        >
                            {toHourOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.label}>
                        הצגת מערכת בית הספר המלאה גם למורים שאינם בצוות הקבוע:
                    </label>
                    <select
                        value={showExternal}
                        onChange={(e) => setShowExternal(e.target.value)}
                        className={styles.selectInput}
                        disabled={isSaving}
                    >
                        {externalTeacherOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className={styles.buttonContainer}>
                <button
                    className={styles.saveButton}
                    onClick={handleSave}
                    disabled={isSaving}
                >
                    {isSaving ? <Loading size="S" color="white" /> : "שמירה"}
                </button>
                <button
                    className={styles.cancelButton}
                    onClick={handleCancel}
                    disabled={isSaving}
                >
                    ביטול
                </button>
            </div>
        </div>
    );
};

export default SettingsPopup;
