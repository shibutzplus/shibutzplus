"use client";

import React, { useState, useRef, useEffect } from "react";
import { usePopup } from "@/context/PopupContext";
import Loading from "@/components/loading/Loading/Loading";
import styles from "./RecurringChoicePopup.module.css";

export type RecurringChoiceMode = "single" | "future";

interface RecurringChoicePopupProps {
    text: string;
    singleLabel?: string;
    futureLabel?: string;
    onChoice: (mode: RecurringChoiceMode) => Promise<void>;
    onCancel?: () => void;
}

const RecurringChoicePopup: React.FC<RecurringChoicePopupProps> = ({
    text,
    singleLabel = "רק עבור יום זה",
    futureLabel = "מעכשיו ועד סוף השנה",
    onChoice,
    onCancel,
}) => {
    const { closePopup } = usePopup();
    const [loadingMode, setLoadingMode] = useState<RecurringChoiceMode | null>(null);
    const chosenRef = useRef(false);

    // If popup closes without user clicking a choice button (e.g. clicked X), trigger onCancel to revert
    useEffect(() => {
        return () => {
            if (!chosenRef.current) {
                onCancel?.();
            }
        };
    }, [onCancel]);

    const handleChoice = async (mode: RecurringChoiceMode) => {
        chosenRef.current = true;
        setLoadingMode(mode);
        await onChoice(mode);
        setLoadingMode(null);
        closePopup();
    };

    const isLoading = loadingMode !== null;

    return (
        <div className={styles.popupContent}>
            <h2 className={styles.title}>{text}</h2>

            <div className={styles.buttonContainer}>
                <button
                    id="recurring-single-btn"
                    className={styles.singleButton}
                    onClick={() => handleChoice("single")}
                    disabled={isLoading}
                >
                    {loadingMode === "single" ? <Loading size="S" /> : singleLabel}
                </button>

                <button
                    id="recurring-future-btn"
                    className={styles.futureButton}
                    onClick={() => handleChoice("future")}
                    disabled={isLoading}
                    autoFocus
                >
                    {loadingMode === "future" ? <Loading size="S" /> : futureLabel}
                </button>
            </div>
        </div>
    );
};

export default RecurringChoicePopup;
