"use client";

import React, { useState } from "react";
import styles from "./EditCellPopup.module.css";
import { usePopup } from "@/context/PopupContext";

interface EditCellPopupProps {
    infoText: string;
    initialSubject: string;
    initialClass: string;
    onSave: (newSubject: string, newClass: string) => void;
}

const EditCellPopup: React.FC<EditCellPopupProps> = ({
    infoText,
    initialSubject,
    initialClass,
    onSave
}) => {
    const { closePopup } = usePopup();
    const [subject, setSubject] = useState(initialSubject);
    const [className, setClassName] = useState(initialClass);

    const handleSave = () => {
        onSave(subject, className);
        closePopup();
    };

    return (
        <div className={styles.popupContent}>
            <div className={styles.title}>{infoText}</div>

            <div className={styles.inputContainer}>
                <input
                    type="text"
                    className={styles.inputField}
                    placeholder="מקצוע"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                />
                <input
                    type="text"
                    className={styles.inputField}
                    placeholder="כיתה"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                />
            </div>

            <div className={styles.buttonContainer}>
                <button
                    className={styles.cancelButton}
                    onClick={closePopup}
                >
                    ביטול
                </button>
                <button
                    className={styles.saveButton}
                    onClick={handleSave}
                >
                    אישור
                </button>
            </div>
        </div>
    );
};

export default EditCellPopup;
