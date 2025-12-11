"use client";

import React, { useState } from "react";
import { usePopup } from "@/context/PopupContext";
import styles from "./SettingsPopup.module.css";
import InputSelect from "@/components/ui/select/InputSelect/InputSelect";
import { SelectOption } from "@/models/types";
import { updateSettingsAction } from "@/app/actions/PUT/updateSettingsAction";
import { errorToast, successToast } from "@/lib/toast";
import { SchoolSettingsType } from "@/models/types/settings";

const hoursOptions: SelectOption[] = Array.from({ length: 5 }, (_, i) => {
    const val = (i + 7).toString();
    return { value: val, label: val };
});

const externalTeacherOptions: SelectOption[] = [
    { value: "yes", label: "כן" },
    { value: "no", label: "לא" },
];

interface SettingsPopupProps {
    schoolId: string;
    initialHours: number;
    initialShowExternal: boolean;
    onSave: (settings: SchoolSettingsType) => void;
}

const SettingsPopup: React.FC<SettingsPopupProps> = ({
    schoolId,
    initialHours,
    initialShowExternal,
    onSave,
}) => {
    const { closePopup } = usePopup();

    const [hours, setHours] = useState<string>(initialHours.toString());
    const [showExternal, setShowExternal] = useState<string>(initialShowExternal ? "yes" : "no");

    const handleSave = async () => {
        if (!schoolId) {
            errorToast("שגיאה: לא נמצא מזהה בית ספר", Infinity);
            return;
        }

        const res = await updateSettingsAction({
            hoursNum: parseInt(hours),
            displaySchedule2Susb: showExternal === "yes",
            schoolId: schoolId,
        });

        if (res.success) {
            successToast(res.message || "ההגדרות נשמרו בהצלחה", 3000);
            if (res.data) {
                onSave(res.data);
            }
            closePopup();
        } else {
            errorToast(res.message || "שגיאה בשמירת ההגדרות", Infinity);
        }
    };

    const handleCancel = () => {
        closePopup();
    };

    return (
        <div className={styles.popupContent}>
            <h2 className={styles.title}>הגדרות מערכת</h2>

            <div className={styles.inputsContainer}>
                <InputSelect
                    label="מספר השעות ביום"
                    options={hoursOptions}
                    value={hours}
                    onChange={(val) => setHours(val)}
                    placeholder="מספר שעות..."
                    isSearchable={false}
                    hasBorder
                />

                <InputSelect
                    label="הצגת השינויים במערכת היומית של בית הספר גם למורים החיצוניים"
                    options={externalTeacherOptions}
                    value={showExternal}
                    onChange={(val) => setShowExternal(val)}
                    placeholder="בחרו..."
                    isSearchable={false}
                    hasBorder
                />
            </div>

            <div className={styles.buttonContainer}>
                <button className={styles.saveButton} onClick={handleSave}>
                    שמירה
                </button>
                <button className={styles.cancelButton} onClick={handleCancel}>
                    ביטול
                </button>
            </div>
        </div>
    );
};

export default SettingsPopup;
