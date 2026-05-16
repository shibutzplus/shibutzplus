"use client";

import React from "react";
import { usePopup } from "@/context/PopupContext";
import styles from "./MsgPopup.module.css";


interface MsgPopupProps {
    message: string | React.ReactNode;
    onOk?: () => void;
    okText?: string;
    preventGlobalClose?: boolean;
    okButtonClassName?: string;
    children?: React.ReactNode;
    hideOkButton?: boolean;
}

const MsgPopup: React.FC<MsgPopupProps> = ({
    message,
    onOk,
    okText = "אישור",
    preventGlobalClose = false,
    okButtonClassName = "",
    children,
    hideOkButton = false,
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
                {!hideOkButton && (
                    <button
                        className={`${styles.okButton} ${okButtonClassName}`}
                        onClick={handleOk}
                        autoFocus
                    >
                        {okText}
                    </button>
                )}
                {children}
            </div>
        </div>
    );
};

export default MsgPopup;
