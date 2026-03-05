import { useState, useRef, useLayoutEffect, useCallback } from "react";
import { useDailyTableContext } from "@/context/DailyTableContext";
import { ColumnTypeValues } from "@/models/types/dailySchedule";

export const useColumnAnimation = (sortedTableColumns: string[], selectedDate: string) => {
    const { deleteColumn, mainDailyTable } = useDailyTableContext();

    // Manual animation state: map of colId -> current width (px)
    const [animatingWidths, setAnimatingWidths] = useState<Record<string, number>>({});
    // Initialize ref with initial columns to prevent animation on mount
    const prevColumnsRef = useRef<string[]>(sortedTableColumns);
    const prevDateRef = useRef<string>(selectedDate);

    // Easing function: easeInOutCubic
    const easeInOutCubic = (t: number): number => {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };

    const handleColumnAnimation = useCallback((colId: string, direction: "add" | "remove") => {

        const getCssNum = (varName: string, fallback: number) => {
            if (typeof window === 'undefined') return fallback;
            const val = getComputedStyle(document.documentElement).getPropertyValue(varName);
            return parseInt(val) || fallback;
        };

        const duration = getCssNum('--daily-delete-duration-ms', 300);

        let targetWidth = 200; // Default teacher width
        const columnData = mainDailyTable[selectedDate]?.[colId];
        const colFirstObj = columnData?.["1"] || Object.values(columnData || {}).find(c => c?.headerCol?.type !== undefined);
        const colType = colFirstObj?.headerCol?.type;

        if (colType === ColumnTypeValues.event) {
            targetWidth = getCssNum('--table-daily-event-col-width-edit', 230);
        } else {
            targetWidth = getCssNum('--table-daily-teacher-col-width-edit', 200);
        }

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
                if (direction === "add") {
                    setAnimatingWidths((prev) => {
                        const { [colId]: _, ...rest } = prev;
                        return rest;
                    });
                } else {
                    deleteColumn(colId);
                }
                return;
            }

            setAnimatingWidths((prev) => ({ ...prev, [colId]: Math.max(0, Math.min(targetWidth, currentWidth)) }));
            requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
    }, [deleteColumn]);

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
            // Only animate width if exactly one column is added (prevent bulk load animation)
            // Removed prevCols.length > 0 check to allow animating the first column added
            if (newCols.length === 1) {
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
