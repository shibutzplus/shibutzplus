"use client";

import React, { useState } from "react";
import { usePopup } from "@/context/PopupContext";
import Icons from "@/style/icons";
import Loading from "@/components/loading/Loading/Loading";
import styles from "./ConfirmPopup.module.css";

interface ConfirmPopupProps {
    text: string | React.ReactNode;
    onYes: () => Promise<void>;
    onNo: () => void;
    yesText?: string;
    noText?: string;
    defaultAnswer?: "yes" | "no";
}

const ConfirmPopup: React.FC<ConfirmPopupProps> = ({
    text,
    onYes,
    onNo,
    yesText = "כן",
    noText = "לא",
    defaultAnswer = "yes"
}) => {
    const { closePopup } = usePopup();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleDelete = async () => {
        setIsLoading(true);
        await onYes();
        setIsLoading(false);
        closePopup();
    };

    const handleCancel = () => {
        onNo();
        closePopup();
    };

    const IconToRender = Icons.faq;

    return (
        <div className={styles.popupContent}>
            {IconToRender && (
                <div className={styles.iconContainer}>
                    <div className={styles.iconBackground}>
                        {typeof IconToRender === 'function' ? <IconToRender size={28} /> : IconToRender}
                    </div>
                </div>
            )}

            {typeof text === 'string' ? <h2 className={styles.title}>{text}</h2> : text}

            <div className={styles.buttonContainer}>
                <button
                    className={defaultAnswer === "no" ? styles.cancelButton : styles.deleteButton}
                    onClick={handleDelete}
                    disabled={isLoading}
                    autoFocus={defaultAnswer === "yes"}
                >
                    {isLoading ? <Loading size="S" /> : yesText}
                </button>
                <button
                    className={defaultAnswer === "no" ? styles.deleteButton : styles.cancelButton}
                    onClick={handleCancel}
                    autoFocus={defaultAnswer === "no"}
                >
                    {noText}
                </button>
            </div>
        </div>
    );
};

export default ConfirmPopup;
