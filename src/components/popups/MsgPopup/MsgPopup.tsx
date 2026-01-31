"use client";

import React from "react";
import { usePopup } from "@/context/PopupContext";
import styles from "./MsgPopup.module.css";


interface MsgPopupProps {
    message: string | React.ReactNode;
    onOk?: () => void;
    okText?: string;
    preventGlobalClose?: boolean;
}

const MsgPopup: React.FC<MsgPopupProps> = ({
    message,
    onOk,
    okText = "אישור",
    preventGlobalClose = false,
}) => {
    const { closePopup } = usePopup();

    const handleOk = () => {
        if (onOk) onOk();
        if (!preventGlobalClose) {
            closePopup();
        }
    };

    return (
        <div className={styles.popupContent}>
            <div className={styles.title}>{message}</div>

            <div className={styles.buttonContainer}>
                <button
                    className={styles.okButton}
                    onClick={handleOk}
                    autoFocus
                >
                    {okText}
                </button>
            </div>
        </div>
    );
};

export default MsgPopup;
