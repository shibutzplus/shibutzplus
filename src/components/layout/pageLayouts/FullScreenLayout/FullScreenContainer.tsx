"use client";

import React, { useEffect } from "react";
import styles from "./PortalFullScreenLayout.module.css";
import Icons from "@/style/icons";

type FullScreenContainerProps = {
    children: React.ReactNode;
    onExit: () => void;
    onSwitch?: () => void;
    isSwitched?: boolean;
    isLoading?: boolean;
};

/**
 * This component acts as a shared wrapper for both:
 * 1. Public pages - Teacher portal - School schedule
 * 2. Private pages - Daily schedule - Manager view
 */
export default function FullScreenContainer({
    children,
    onExit,
    onSwitch,
    isSwitched = false,
    isLoading = false,
}: FullScreenContainerProps) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onExit();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [onExit]);

    const computedTitle = isSwitched
        ? "מעבר לתצוגה לפי מורים"
        : "מעבר לתצוגה לפי כיתות";

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100dvh",
                overflow: "hidden",
                zIndex: 9999,
                backgroundColor: "var(--background-color)",
                paddingTop: "0.2vh",
            }}
        >
            {/* Exit full-screen button (floating top-left) */}
            {!isLoading && (
                <button
                    className={styles.fabClose}
                    onClick={onExit}
                    title="יציאה ממסך מלא"
                    aria-label="Exit Full Screen"
                >
                    <Icons.closeBold style={{ width: "68%", height: "68%" }} />
                </button>
            )}

            {/* Switch view mode button (floating top-right) */}
            {!isLoading && onSwitch && (
                <button
                    className={styles.fabSwitch}
                    onClick={onSwitch}
                    title={computedTitle}
                    aria-label={computedTitle}
                >
                    <span
                        className={`${styles.switchIcon} ${
                            isSwitched ? styles.switchIconFlipped : ""
                        }`}
                        style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                        <Icons.switchBold style={{ width: "75%", height: "75%" }} />
                    </span>
                </button>
            )}

            {children}
        </div>
    );
}
