"use client";

import React from "react";
import styles from "./DeletePopup.module.css";
import { usePopup } from "@/context/PopupContext";
import DeleteSvg from "@/components/ui/assets/deleteBtn";

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
