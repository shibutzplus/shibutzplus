"use client";

import React from "react";
import styles from "./DeletePopup.module.css";
import { usePopup } from "@/context/PopupContext";

const DeleteSvg = () => {
    return (
        <svg
            className={styles.trashIcon}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
        </svg>
    );
};

interface DeletePopupProps {
    text: string;
    onDelete: () => Promise<void>;
    onCancel: () => void;
}

const DeletePopup: React.FC<DeletePopupProps> = ({ text, onDelete, onCancel }) => {
    const { closePopup } = usePopup();

    const handleDelete = async () => {
        await onDelete();
        closePopup();
    };

    const handleCancel = () => {
        onCancel();
        closePopup();
    };

    return (
        <div className={styles.popupContent}>
            <div className={styles.iconContainer}>
                <div className={styles.iconBackground}>
                    <DeleteSvg />
                </div>
            </div>

            <h2 className={styles.title}>{text}</h2>

            <div className={styles.buttonContainer}>
                <button className={styles.deleteButton} onClick={handleDelete}>
                    מחיקה
                </button>
                <button className={styles.cancelButton} onClick={handleCancel}>
                    ביטול
                </button>
            </div>
        </div>
    );
};

export default DeletePopup;
