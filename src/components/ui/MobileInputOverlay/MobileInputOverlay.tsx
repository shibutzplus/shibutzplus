"use client";

import React, { useEffect, useRef } from "react";
import { useMobileInput } from "@/context/MobileInputContext";
import styles from "./MobileInputOverlay.module.css";

const MobileInputOverlay: React.FC = () => {
    const { isOverlayOpen, inputValue, placeholder, onSave, closeOverlay, updateValue } = useMobileInput();
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOverlayOpen) {
            // Prevent body scrolling when overlay is open
            document.body.style.overflow = 'hidden';
            
            // Focus the input after a short delay to ensure the overlay is rendered
            if (inputRef.current) {
                setTimeout(() => {
                    inputRef.current?.focus();
                }, 100);
            }
        } else {
            // Restore body scrolling when overlay is closed
            document.body.style.overflow = '';
        }

        // Cleanup function to restore scrolling if component unmounts
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOverlayOpen]);

    const handleSave = () => {
        onSave(inputValue);
        closeOverlay();
    };

    const handleCancel = () => {
        closeOverlay();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSave();
        } else if (e.key === "Escape") {
            e.preventDefault();
            handleCancel();
        }
    };

    if (!isOverlayOpen) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <button 
                        className={styles.cancelButton} 
                        onClick={handleCancel}
                        type="button"
                    >
                        ✕
                    </button>
                    <button 
                        className={styles.saveButton} 
                        onClick={handleSave}
                        type="button"
                    >
                        שמור
                    </button>
                </div>
                <div className={styles.inputContainer}>
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        placeholder={placeholder}
                        onChange={(e) => updateValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className={styles.input}
                    />
                </div>
            </div>
        </div>
    );
};

export default MobileInputOverlay;
