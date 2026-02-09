"use client";

import React from "react";
import styles from "./PortalFullScreenLayout.module.css";
import Icons from "@/style/icons";

type FullScreenContainerProps = {
    children: React.ReactNode;
    onExit: () => void;
};

/**
 * This component acts as a shared wrapper for both:
 * 1. Public pages - Teacher portal - School schedule
 * 2. Private pages - Daily schedule - Manager view
 */
export default function FullScreenContainer({ children, onExit }: FullScreenContainerProps) {
    return (
        <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100dvh",
            overflow: "hidden",
            zIndex: 9999,
            backgroundColor: "var(--background-color)",
            paddingTop: "0.2vh",
        }}>
            <button
                className={styles.fab}
                onClick={onExit}
                title="יציאה ממסך מלא"
                aria-label="Exit Full Screen"
            >
                <Icons.close size={24} />
            </button>
            {children}
        </div>
    );
}
