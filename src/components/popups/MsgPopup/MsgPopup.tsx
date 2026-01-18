"use client";

import React from "react";
import { usePopup } from "@/context/PopupContext";
import styles from "./MsgPopup.module.css";
import Icons from "@/style/icons";

interface MsgPopupProps {
    message: string | React.ReactNode;
    onOk?: () => void;
    okText?: string;
    displayIcon?: boolean;
}

const MsgPopup: React.FC<MsgPopupProps> = ({
    message,
    onOk,
    okText = "אישור",
    displayIcon = true,
}) => {
    const { closePopup } = usePopup();

    const handleOk = () => {
        if (onOk) onOk();
        closePopup();
    };

    const IconToRender = Icons.info;

    return (
        <div className={styles.popupContent}>
            {displayIcon && IconToRender && (
                <div className={styles.iconContainer}>
                    <div>
                        {typeof IconToRender === 'function' ? <IconToRender size={32} /> : IconToRender}
                    </div>
                </div>
            )}

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
