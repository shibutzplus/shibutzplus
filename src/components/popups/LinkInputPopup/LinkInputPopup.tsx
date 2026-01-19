"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "./LinkInputPopup.module.css";

interface LinkInputPopupProps {
    initialUrl?: string;
    onConfirm: (url: string) => void;
    onCancel: () => void;
}

const LinkInputPopup: React.FC<LinkInputPopupProps> = ({
    initialUrl = "",
    onConfirm,
    onCancel,
}) => {
    const [url, setUrl] = useState(initialUrl);
    const [error, setError] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Focus the input when the component mounts
        inputRef.current?.focus();
        // Select all text if there's an initial URL
        if (initialUrl) {
            inputRef.current?.select();
        }
    }, [initialUrl]);

    const handleConfirm = () => {
        let trimmedUrl = url.trim();
        if (!trimmedUrl) {
            // Empty allow - clear link
            onConfirm("");
            return;
        }

        // Minimal validation: must contain at least one dot (unless it's a known protocol like mailto/tel which we removed support for, but mostly web urls need dots)
        // or if it already starts with http/https (localhost edge case usually ignored for regular users)
        if (!trimmedUrl.includes('.') && !/^(https?:\/\/)/i.test(trimmedUrl)) {
            setError("כתובת לא תקינה (לדוגמה: google.com)");
            return;
        }

        // Check if it starts with http or https
        const protocolRegex = /^(https?:\/\/)/i;
        if (!protocolRegex.test(trimmedUrl)) {
            // If not, assume it's a web link and prepend https://
            trimmedUrl = 'https://' + trimmedUrl;
        }

        onConfirm(trimmedUrl);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUrl(e.target.value);
        if (error) setError("");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleConfirm();
        } else if (e.key === "Escape") {
            e.preventDefault();
            onCancel();
        }
    };

    return (
        <div className={styles.popupContent}>
            <div className={styles.title}>הוספת קישור</div>

            <div className={styles.inputContainer}>
                <input
                    ref={inputRef}
                    type="text"
                    className={`${styles.input} ${error ? styles.error : ''}`}
                    value={url}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder="https://example.com"
                    dir="ltr"
                />
                {error && <div className={styles.errorMessage}>{error}</div>}
            </div>

            <div className={styles.buttonContainer}>
                <button
                    className={styles.confirmButton}
                    onClick={handleConfirm}
                >
                    אישור
                </button>
                <button
                    className={styles.cancelButton}
                    onClick={onCancel}
                >
                    ביטול
                </button>
            </div>
        </div>
    );
};

export default LinkInputPopup;
