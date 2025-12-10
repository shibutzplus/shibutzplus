import React, { useMemo, useState, useRef, useLayoutEffect } from "react";
import { motion } from "motion/react";
import styles from "./DailyTable.module.css";
import { TableRows } from "@/models/constant/table";
import EmptyTable from "@/components/empty/EmptyTable/EmptyTable";
import { DailySchedule, ColumnType } from "@/models/types/dailySchedule";
import { useSortColumns } from "./useSortColumns";
import { TeacherType } from "@/models/types/teachers";
import { useDailyTableContext } from "@/context/DailyTableContext";
import DailyTeacherHeader from "../DailyTeacherHeader/DailyTeacherHeader";
import DailyEventHeader from "../DailyEventHeader/DailyEventHeader";
import DailyTeacherCell from "../DailyTeacherCell/DailyTeacherCell";
import DailyEventCell from "../DailyEventCell/DailyEventCell";


type DailyTableProps = {
    mainDailyTable: DailySchedule;
    selectedDate: string;
    onTeacherClick: (teacher: TeacherType) => Promise<void>;
};

const DailyTable: React.FC<DailyTableProps> = ({
    mainDailyTable,
    selectedDate,
    onTeacherClick,
}) => {
    const { deleteColumn } = useDailyTableContext();
    const schedule = mainDailyTable[selectedDate];
    const tableColumns = schedule ? Object.keys(schedule) : [];
    const sortedTableColumns = useSortColumns(schedule, mainDailyTable, selectedDate, tableColumns);

    const rows = Array.from({ length: TableRows }, (_, i) => i + 1);

    // Manual animation state: map of colId -> current width (px)
    const [animatingWidths, setAnimatingWidths] = useState<Record<string, number>>({});
    // Initialize ref with initial columns to prevent animation on mount
    const prevColumnsRef = useRef<string[]>(sortedTableColumns);
    const prevDateRef = useRef<string>(selectedDate);

    const handleColumnAnimation = (colId: string, direction: "add" | "remove") => {
        // Get duration from CSS variable or default to 300ms
        const cssDuration = typeof window !== 'undefined' ? getComputedStyle(document.documentElement).getPropertyValue('--daily-delete-duration-ms') : "300";
        const duration = parseInt(cssDuration) || 300;
        const targetWidth = 250;
        const step = targetWidth / (duration / 16.66);

        // Initial setup
        let currentWidth = direction === "add" ? 0 : targetWidth;
        setAnimatingWidths((prev) => ({ ...prev, [colId]: currentWidth }));

        const animate = () => {
            if (direction === "add") {
                currentWidth += step;
                if (currentWidth >= targetWidth) {
                    // Animation complete (Add)
                    setAnimatingWidths((prev) => {
                        const { [colId]: _, ...rest } = prev;
                        return rest;
                    });
                    return;
                }
            } else {
                currentWidth -= step;
                if (currentWidth <= 0) {
                    // Animation complete (Remove)
                    setAnimatingWidths((prev) => {
                        const { [colId]: _, ...rest } = prev;
                        return rest;
                    });
                    // Trigger deletion only after animation finishes
                    deleteColumn(colId);
                    return;
                }
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


    // Calculate column types once
    const columnTypes = useMemo(() => {
        const types: Record<string, ColumnType> = {};
        if (!schedule) return types;

        sortedTableColumns.forEach(colId => {
            const columnData = schedule[colId];
            if (!columnData) return;

            const colFirstObj =
                columnData["1"] ||
                Object.values(columnData).find((cell) => cell?.headerCol?.type);

            types[colId] = colFirstObj?.headerCol?.type || "event";
        });
        return types;
    }, [schedule, sortedTableColumns]);

    const getColorClass = (type: ColumnType) => {
        switch (type) {
            case "existingTeacher":
                return styles.headerBlue;
            case "missingTeacher":
                return styles.headerRed;
            case "event":
                return styles.headerGreen;
            default:
                return styles.headerBlue;
        }
    };


    if (!schedule || Object.keys(schedule).length === 0) {
        return <EmptyTable />;
    }

    return (
        <div className={styles.tableContainer}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        {/* Sticky Row Number Column Header (Corner) */}
                        <th
                            className={`${styles.headerCell} ${styles.cornerCell}`}
                        >
                            <div className={`${styles.headerInner} ${styles.headerGray}`}></div>
                        </th>

                        {sortedTableColumns.map((colId, colIndex) => {
                            const type = columnTypes[colId] || "event";
                            const headerColorClass = getColorClass(type);
                            const width = animatingWidths[colId];
                            const isAnimating = width !== undefined;

                            const style = isAnimating ? {
                                width: `${width}px`,
                                minWidth: `${width}px`,
                                maxWidth: `${width}px`,
                                overflow: "hidden",
                                padding: 0
                            } : undefined;

                            return (
                                <th
                                    key={colId}
                                    className={`${styles.headerCell} ${styles.regularHeaderCell}`}
                                    style={style}
                                >
                                    <motion.div
                                        className={`${styles.headerInner} ${headerColorClass}`}
                                        style={isAnimating ? { width: `${width}px` } : undefined}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3, delay: colIndex * 0.02 }}
                                    >
                                        {type === "event" ? (
                                            <DailyEventHeader columnId={colId} type={type} onDelete={isAnimating ? undefined : (id) => handleColumnAnimation(id, "remove")} />
                                        ) : (
                                            <DailyTeacherHeader
                                                columnId={colId}
                                                type={type}
                                                onTeacherClick={onTeacherClick}
                                                onDelete={isAnimating ? undefined : (id) => handleColumnAnimation(id, "remove")}
                                            />
                                        )}
                                    </motion.div>
                                </th>
                            );
                        })}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr key={row}>
                            <td
                                className={styles.rowNumberCell}
                            >
                                <div className={styles.rowNumberBadge}>
                                    {row}
                                </div>
                            </td>

                            {sortedTableColumns.map((colId, colIndex) => {
                                const type = columnTypes[colId] || "event";
                                const columnData = schedule[colId];
                                if (!columnData) return null;
                                const cellData = columnData[row]; // row is the hour index

                                const width = animatingWidths[colId];
                                const isAnimating = width !== undefined;
                                const style = isAnimating ? {
                                    width: `${width}px`,
                                    minWidth: `${width}px`,
                                    maxWidth: `${width}px`,
                                    overflow: "hidden",
                                    padding: 0
                                } : undefined;

                                return (
                                    <td
                                        key={`${colId}-${row}`}
                                        className={`${styles.dataCell} ${styles.regularDataCell}`}
                                        style={style}
                                    >
                                        <motion.div
                                            className={styles.cellContent}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.3, delay: colIndex * 0.02 }}
                                        >
                                            {type === "event" ? (
                                                <DailyEventCell cell={cellData} columnId={colId} />
                                            ) : (
                                                <DailyTeacherCell
                                                    key={`${colId}-${row}-${cellData?.subTeacher?.id || cellData?.class?.id || 'empty'}`}
                                                    cell={cellData}
                                                    columnId={colId}
                                                    type={type}
                                                />
                                            )}
                                        </motion.div>
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DailyTable;
