import React, { useMemo, useState, useRef, useLayoutEffect } from "react";
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
    const prevColumnsRef = useRef<string[]>([]);

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
        const prevCols = prevColumnsRef.current;
        const newCols = sortedTableColumns.filter(id => !prevCols.includes(id));

        if (newCols.length > 0) {
            newCols.forEach(colId => {
                // Only animate if it's not already being animated (prevent double triggers)
                // We check if it's in schedule to avoid animating totally bogus IDs, 
                // though sortedTableColumns comes from the schedule anyway.
                handleColumnAnimation(colId, "add");
            });
        }

        // Update ref
        prevColumnsRef.current = sortedTableColumns;
    }, [sortedTableColumns]);


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

                        {sortedTableColumns.map((colId) => {
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
                                    <div className={`${styles.headerInner} ${headerColorClass}`} style={isAnimating ? { width: `${width}px` } : undefined}>
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
                                    </div>
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

                            {sortedTableColumns.map((colId) => {
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
                                        <div className={styles.cellContent}>
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
                                        </div>
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
