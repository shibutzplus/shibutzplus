"use client";

import React, { useState } from "react";
import { usePopup } from "@/context/PopupContext";
import DeleteSvg from "@/components/ui/assets/deleteBtn";
import Loading from "@/components/core/Loading/Loading";
import styles from "./DeletePopup.module.css";

interface DeletePopupProps {
    text: string;
    onDelete: () => Promise<void>;
    onCancel: () => void;
}

const DeletePopup: React.FC<DeletePopupProps> = ({ text, onDelete, onCancel }) => {
    const { closePopup } = usePopup();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleDelete = async () => {
        setIsLoading(true);
        await onDelete();
        setIsLoading(false);
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
                <button className={styles.deleteButton} onClick={handleDelete} disabled={isLoading}>
                    {isLoading ? <Loading size="S" /> : "מחיקה"}
                </button>
                <button className={styles.cancelButton} onClick={handleCancel}>
                    ביטול
                </button>
            </div>
        </div>
    );
};

export default DeletePopup;
