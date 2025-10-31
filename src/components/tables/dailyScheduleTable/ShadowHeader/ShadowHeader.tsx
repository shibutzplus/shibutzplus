import React, { useState, useEffect, useRef } from "react";
import styles from "./ShadowHeader.module.css";

type ShadowHeaderProps = {
    columnId: string;
    children: React.ReactNode;
};

const ShadowHeader: React.FC<ShadowHeaderProps> = ({ columnId, children }) => {
    const [leftPosition, setLeftPosition] = useState(0);
    const [columnExists, setColumnExists] = useState(true);
    const shadowHeaderRef = useRef<HTMLDivElement>(null);

    // Track the position of the original column to sync shadow header position
    useEffect(() => {
        const updatePosition = () => {
            // Find the original column element
            const originalColumn = document.querySelector(`[data-column-id="${columnId}"]`);
            if (originalColumn) {
                setColumnExists(true);
                const rect = originalColumn.getBoundingClientRect();
                const dailyTableContainer = document.querySelector('[class*="dailyTable"]');
                if (dailyTableContainer) {
                    const containerRect = dailyTableContainer.getBoundingClientRect();
                    // Calculate the left position relative to the container
                    const relativeLeft = rect.left - containerRect.left;
                    setLeftPosition(relativeLeft);
                }
            } else {
                // If column doesn't exist, mark it as non-existent
                setColumnExists(false);
                setLeftPosition(-9999);
            }
        };

        // Update position initially
        updatePosition();

        // Update position on scroll
        const dailyTableContainer = document.querySelector('[class*="dailyTable"]');
        if (dailyTableContainer) {
            dailyTableContainer.addEventListener("scroll", updatePosition, { passive: true });
        }

        // Update position on window resize
        window.addEventListener("resize", updatePosition, { passive: true });

        // Watch for DOM changes (column additions/deletions)
        const mutationObserver = new MutationObserver(() => {
            // Delay the position update to allow DOM to settle
            setTimeout(updatePosition, 50);
        });

        // Observe changes in the daily table container
        if (dailyTableContainer) {
            mutationObserver.observe(dailyTableContainer, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['data-column-id']
            });
        }

        return () => {
            if (dailyTableContainer) {
                dailyTableContainer.removeEventListener("scroll", updatePosition);
            }
            window.removeEventListener("resize", updatePosition);
            mutationObserver.disconnect();
        };
    }, [columnId]);

    // Don't render if the column doesn't exist
    if (!columnExists) {
        return null;
    }

    return (
        <div
            ref={shadowHeaderRef}
            className={`${styles.shadowHeader} ${styles.visible}`}
            style={{ left: `${leftPosition}px` }}
        >
            <div className={styles.shadowHeaderBackground}>{children}</div>
        </div>
    );
};

export default ShadowHeader;
