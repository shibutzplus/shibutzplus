"use client";

import React, { useState } from "react";
import { usePopup } from "@/context/PopupContext";
import DeleteSvg from "@/components/ui/assets/deleteBtn";
import Loading from "@/components/loading/Loading/Loading";
import styles from "./DeletePopup.module.css";

interface DeletePopupProps {
    text: string;
    onDelete: () => Promise<void>;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    Icon?: React.ElementType | React.ReactNode;
    isDefaultCancel?: boolean;
}

const DeletePopup: React.FC<DeletePopupProps> = ({
    text,
    onDelete,
    onCancel,
    confirmText = "מחיקה",
    cancelText = "ביטול",
    Icon,
    isDefaultCancel = false
}) => {
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
                    {Icon ? (
                        /* Check if Icon is a function component (React.ElementType) or a node */
                        typeof Icon === 'function' ? <Icon size={40} /> : Icon
                    ) : (
                        <DeleteSvg />
                    )}
                </div>
            </div>

            <h2 className={styles.title}>{text}</h2>

            <div className={styles.buttonContainer}>
                <button
                    className={isDefaultCancel ? styles.cancelButton : styles.deleteButton}
                    onClick={handleDelete}
                    disabled={isLoading}
                    autoFocus={!isDefaultCancel}
                >
                    {isLoading ? <Loading size="S" /> : confirmText}
                </button>
                <button
                    className={isDefaultCancel ? styles.deleteButton : styles.cancelButton}
                    onClick={handleCancel}
                    autoFocus={isDefaultCancel}
                >
                    {cancelText}
                </button>
            </div>
        </div>
    );
};

export default DeletePopup;
