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
                // Look for either dailyTable or previewTable container
                const tableContainer = document.querySelector('[class*="dailyTable"]') || 
                                      document.querySelector('[class*="previewTable"]');
                if (tableContainer) {
                    const containerRect = tableContainer.getBoundingClientRect();
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
        const tableContainer = document.querySelector('[class*="dailyTable"]') || 
                               document.querySelector('[class*="previewTable"]');
        if (tableContainer) {
            tableContainer.addEventListener("scroll", updatePosition, { passive: true });
        }

        // Update position on window resize
        window.addEventListener("resize", updatePosition, { passive: true });

        // Watch for DOM changes (column additions/deletions)
        const mutationObserver = new MutationObserver(() => {
            // Delay the position update to allow DOM to settle
            setTimeout(updatePosition, 50);
        });

        // Observe changes in the table container
        if (tableContainer) {
            mutationObserver.observe(tableContainer, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['data-column-id']
            });
        }

        return () => {
            if (tableContainer) {
                tableContainer.removeEventListener("scroll", updatePosition);
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
