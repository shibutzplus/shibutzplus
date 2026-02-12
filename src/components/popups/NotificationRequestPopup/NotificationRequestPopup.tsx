"use client";

import React from "react";
import { usePopup } from "@/context/PopupContext";
import Icons from "@/style/icons";
import styles from "./NotificationRequestPopup.module.css";

interface NotificationRequestPopupProps {
    onConfirm: () => void;
    onCancel: () => void;
}

const NotificationRequestPopup: React.FC<NotificationRequestPopupProps> = ({
    onConfirm,
    onCancel,
}) => {
    const { closePopup } = usePopup();

    const handleConfirm = () => {
        onConfirm();
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
                    <Icons.bell size={32} />
                </div>
            </div>

            <h2 className={styles.title}>עדכוני מערכת בזמן אמת</h2>

            <p className={styles.text}>
            </p>

            <div className={styles.buttonContainer}>
                <button className={styles.confirmButton} onClick={handleConfirm}>
                    אישור
                </button>
                <button className={styles.cancelButton} onClick={handleCancel}>
                    ביטול
                </button>
            </div>
        </div>
    );
};

export default NotificationRequestPopup;
