import { useState, useRef, useLayoutEffect } from "react";
import { useDailyTableContext } from "@/context/DailyTableContext";

export const useColumnAnimation = (sortedTableColumns: string[], selectedDate: string) => {
    const { deleteColumn } = useDailyTableContext();

    // Manual animation state: map of colId -> current width (px)
    const [animatingWidths, setAnimatingWidths] = useState<Record<string, number>>({});
    // Initialize ref with initial columns to prevent animation on mount
    const prevColumnsRef = useRef<string[]>(sortedTableColumns);
    const prevDateRef = useRef<string>(selectedDate);

    // Easing function: easeInOutCubic
    const easeInOutCubic = (t: number): number => {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };

    const handleColumnAnimation = (colId: string, direction: "add" | "remove") => {
        // Get duration from CSS variable or default to 300ms
        const cssDuration = typeof window !== 'undefined' ? getComputedStyle(document.documentElement).getPropertyValue('--daily-delete-duration-ms') : "300";
        const duration = parseInt(cssDuration) || 300;
        const targetWidth = 250;

        // Initial setup
        const startTime = performance.now();
        const startWidth = direction === "add" ? 0 : targetWidth;
        const endWidth = direction === "add" ? targetWidth : 0;

        setAnimatingWidths((prev) => ({ ...prev, [colId]: startWidth }));

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easeInOutCubic(progress);

            const currentWidth = startWidth + (endWidth - startWidth) * easedProgress;

            if (progress >= 1) {
                // Animation complete
                if (direction === "add") {
                    setAnimatingWidths((prev) => {
                        const { [colId]: _, ...rest } = prev;
                        return rest;
                    });
                } else {
                    setAnimatingWidths((prev) => {
                        const { [colId]: _, ...rest } = prev;
                        return rest;
                    });
                    // Trigger deletion only after animation finishes
                    deleteColumn(colId);
                }
                return;
            }

            // Update state for render
            setAnimatingWidths((prev) => ({ ...prev, [colId]: Math.max(0, Math.min(targetWidth, currentWidth)) }));
            requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
    };

    // Detect added columns
    useLayoutEffect(() => {
        // If date changed, reset state without animating
        if (prevDateRef.current !== selectedDate) {
            prevDateRef.current = selectedDate;
            prevColumnsRef.current = sortedTableColumns;
            return;
        }

        const prevCols = prevColumnsRef.current;
        const newCols = sortedTableColumns.filter(id => !prevCols.includes(id));

        if (newCols.length > 0) {
            // Only animate width if we already had columns (i.e. not initial load)
            // AND only if exactly one column is added (prevent bulk load animation)
            if (prevCols.length > 0 && newCols.length === 1) {
                newCols.forEach(colId => {
                    handleColumnAnimation(colId, "add");
                });
            }
        }

        // Update ref
        prevColumnsRef.current = sortedTableColumns;
    }, [sortedTableColumns, selectedDate]);

    return { animatingWidths, handleColumnAnimation };
};
