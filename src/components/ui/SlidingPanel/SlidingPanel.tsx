"use client";

import { useRef, useState, useEffect } from "react";
import { IoCloseOutline } from "react-icons/io5";
import { useAccessibility } from "@/hooks/browser/useAccessibility";
import styles from "./SlidingPanel.module.css";

type SlidingPanelProps = {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    position?: "left" | "right";
};

const SlidingPanel: React.FC<SlidingPanelProps> = ({
    isOpen,
    onClose,
    title,
    children,
    position = "left",
}) => {
    const panelRef = useRef<HTMLDivElement>(null);
    const [shouldRender, setShouldRender] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    // Use the accessibility hook for all accessibility features
    useAccessibility({ isOpen: isOpen && shouldRender, navRef: panelRef, onClose });

    // Handle mounting and unmounting with animation
    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            // Trigger animation after a small delay to ensure DOM is ready
            const timer = setTimeout(() => {
                setIsAnimating(true);
            }, 10);
            return () => clearTimeout(timer);
        } else {
            setIsAnimating(false);
            // Wait for animation to complete before unmounting
            const timer = setTimeout(() => {
                setShouldRender(false);
            }, 300); // Match the CSS transition duration
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!shouldRender) return null;

    return (
        <>
            {/* Backdrop with blur */}
            <div
                className={`${styles.backdrop} ${isAnimating ? styles.backdropVisible : ""}`}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Sliding Panel */}
            <div
                ref={panelRef}
                className={`${styles.panel} ${styles[position]} ${isAnimating ? styles.open : ""}`}
                role="dialog"
                aria-modal="true"
            >
                <header className={styles.panelHeader}>
                    <h3>שינויים במערכת - {title}</h3>
                    <button
                        onClick={onClose}
                        className={styles.closeButton}
                        aria-label="Close panel"
                    >
                        <IoCloseOutline className={styles.closeIcon} />
                    </button>
                </header>
                <div className={styles.content}>{children}</div>
            </div>
        </>
    );
};

export default SlidingPanel;
