"use client";

// Unified X close button for all popups, modals, panels, and fullscreen

import React from "react";
import styles from "./CloseButton.module.css";
import Icons from "@/style/icons";

export type CloseButtonSize = "md" | "lg";

export interface CloseButtonProps {
    onClose?: () => void;
    dark?: boolean;
    size?: CloseButtonSize;
    className?: string;
}

const SIZE_TO_ICON_SIZE: Record<CloseButtonSize, number> = {
    md: 18,
    lg: 22,
};

export const CloseButton: React.FC<CloseButtonProps> = ({
    onClose,
    dark = false,
    size = "md",
    className,
}) => {
    const sizeClass = size === "lg" ? styles.sizeLg : styles.sizeMd;
    const darkClass = dark ? styles.dark : "";

    return (
        <button
            type="button"
            onClick={onClose}
            title="סגור"
            aria-label="סגור"
            className={`${styles.closeButton} ${darkClass} ${sizeClass}${className ? ` ${className}` : ""}`}
        >
            <Icons.close size={SIZE_TO_ICON_SIZE[size]} aria-hidden="true" />
        </button>
    );
};

export default CloseButton;
