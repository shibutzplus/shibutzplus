import React, { useEffect, useMemo, useRef } from "react";
import styles from "./DailyTable.module.css";
import EmptyTable from "@/components/empty/EmptyTable/EmptyTable";
import { DailySchedule, ColumnType } from "@/models/types/dailySchedule";
import { useSortColumns } from "./useSortColumns";
import { TeacherType } from "@/models/types/teachers";
import DailyTeacherHeader from "../DailyTeacherHeader/DailyTeacherHeader";
import DailyEventHeader from "../DailyEventHeader/DailyEventHeader";
import DailyTeacherCell from "../DailyTeacherCell/DailyTeacherCell";
import DailyEventCell from "../DailyEventCell/DailyEventCell";
import { useMainContext } from "@/context/MainContext";
import { HOURS_IN_DAY } from "@/utils/time";
import { useDailyTableContext } from "@/context/DailyTableContext";
import { AnimatePresence, motion } from "motion/react";

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
    const { settings } = useMainContext();
    const { deleteColumn } = useDailyTableContext();
    const hoursNum = settings?.hoursNum || HOURS_IN_DAY;

    const schedule = mainDailyTable[selectedDate];
    const tableColumns = schedule ? Object.keys(schedule) : [];
    const sortedTableColumns = useSortColumns(schedule, mainDailyTable, selectedDate, tableColumns);

    const prevSortedColumnsRef = useRef<string[]>([]);

    useEffect(() => {
        // Compare current columns with previous to find the new one
        if (prevSortedColumnsRef.current.length < sortedTableColumns.length) {
            const newColumns = sortedTableColumns.filter(colId => !prevSortedColumnsRef.current.includes(colId));

            // Only scroll if exactly one new column is added (avoids scrolling on initial load or bulk updates)
            if (newColumns.length === 1) {
                const newColId = newColumns[0];
                const elementId = `col-${newColId}`;

                // Small delay to ensure the DOM is updated
                setTimeout(() => {
                    const element = document.getElementById(elementId);
                    if (element) {
                        element.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
                    }
                }, 100);
            }
        }

        prevSortedColumnsRef.current = sortedTableColumns;
    }, [sortedTableColumns]);

    const rows = Array.from({ length: hoursNum }, (_, i) => i + 1);

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

                        <AnimatePresence>
                            {sortedTableColumns.map((colId) => {
                                const type = columnTypes[colId] || "event";
                                const headerColorClass = getColorClass(type);

                                return (
                                    <motion.th
                                        key={colId}
                                        id={`col-${colId}`}
                                        className={`${styles.headerCell} ${styles.regularHeaderCell}`}
                                        initial={{ opacity: 0, width: 0, minWidth: 0, maxWidth: 0 }}
                                        animate={{ opacity: 1, width: "var(--table-daily-col-width)", minWidth: "var(--table-daily-col-width)", maxWidth: "var(--table-daily-col-width)", transition: { duration: 0.2 } }}
                                        exit={{ opacity: 0, width: 0, minWidth: 0, maxWidth: 0, transition: { opacity: { duration: 0.1 }, default: { duration: 0.2 } } }}
                                        style={{ overflow: "hidden", whiteSpace: "nowrap" }}
                                    >
                                        <div className={`${styles.headerInner} ${headerColorClass}`} style={{ width: "100%" }}>
                                            {type === "event" ? (
                                                <DailyEventHeader columnId={colId} type={type} onDelete={(id) => deleteColumn(id)} />
                                            ) : (
                                                <DailyTeacherHeader
                                                    columnId={colId}
                                                    type={type}
                                                    onTeacherClick={onTeacherClick}
                                                    onDelete={(id) => deleteColumn(id)}
                                                />
                                            )}
                                        </div>
                                    </motion.th>
                                );
                            })}
                        </AnimatePresence>
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

                            <AnimatePresence>
                                {sortedTableColumns.map((colId) => {
                                    const type = columnTypes[colId] || "event";
                                    const columnData = schedule[colId];
                                    if (!columnData) return null;
                                    const cellData = columnData[row];

                                    return (
                                        <motion.td
                                            key={`${colId}-${row}`}
                                            className={`${styles.dataCell} ${styles.regularDataCell}`}
                                            initial={{ opacity: 0, width: 0, minWidth: 0, maxWidth: 0 }}
                                            animate={{ opacity: 1, width: "var(--table-daily-col-width)", minWidth: "var(--table-daily-col-width)", maxWidth: "var(--table-daily-col-width)", transition: { duration: 0.2 } }}
                                            exit={{ opacity: 0, width: 0, minWidth: 0, maxWidth: 0, transition: { opacity: { duration: 0.1 }, default: { duration: 0.2 } } }}
                                            style={{ overflow: "hidden", whiteSpace: "nowrap" }}
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
                                        </motion.td>
                                    );
                                })}
                            </AnimatePresence>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DailyTable;
