import React, { useMemo } from "react";
import { motion } from "motion/react";
import styles from "./DailyTable.module.css";
import { TableRows } from "@/models/constant/table";
import EmptyTable from "@/components/empty/EmptyTable/EmptyTable";
import { DailySchedule, ColumnType } from "@/models/types/dailySchedule";
import { useSortColumns } from "./useSortColumns";
import { TeacherType } from "@/models/types/teachers";
import DailyTeacherHeader from "../DailyTeacherHeader/DailyTeacherHeader";
import DailyEventHeader from "../DailyEventHeader/DailyEventHeader";
import DailyTeacherCell from "../DailyTeacherCell/DailyTeacherCell";
import DailyEventCell from "../DailyEventCell/DailyEventCell";
import { useColumnAnimation } from "./useColumnAnimation";

// --- Wrapper Components ---

type AnimatedHeaderWrapperProps = {
    colIndex: number;
    width: number | undefined;
    headerColorClass: string;
    children: React.ReactNode;
    id?: string;
};

const AnimatedHeaderWrapper: React.FC<AnimatedHeaderWrapperProps> = React.memo(({ colIndex, width, headerColorClass, children, id }) => {
    const isAnimating = width !== undefined;
    return (
        <th
            id={id}
            className={`${styles.headerCell} ${styles.regularHeaderCell}`}
            style={isAnimating ? {
                width: `${width}px`,
                minWidth: `${width}px`,
                maxWidth: `${width}px`,
                overflow: "hidden",
                padding: 0
            } : undefined}
        >
            <motion.div
                className={`${styles.headerInner} ${headerColorClass}`}
                style={isAnimating ? { width: `${width}px` } : undefined}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: colIndex * 0.02 }}
            >
                {children}
            </motion.div>
        </th>
    );
});

type AnimatedCellWrapperProps = {
    colIndex: number;
    width: number | undefined;
    children: React.ReactNode;
};

const AnimatedCellWrapper: React.FC<AnimatedCellWrapperProps> = React.memo(({ colIndex, width, children }) => {
    const isAnimating = width !== undefined;
    return (
        <td
            className={`${styles.dataCell} ${styles.regularDataCell}`}
            style={isAnimating ? {
                width: `${width}px`,
                minWidth: `${width}px`,
                maxWidth: `${width}px`,
                overflow: "hidden",
                padding: 0
            } : undefined}
        >
            <motion.div
                className={styles.cellContent}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: colIndex * 0.02 }}
            >
                {children}
            </motion.div>
        </td>
    );
});


// --- Main Properties ---

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
    const schedule = mainDailyTable[selectedDate];
    const tableColumns = schedule ? Object.keys(schedule) : [];
    const sortedTableColumns = useSortColumns(schedule, mainDailyTable, selectedDate, tableColumns);

    const prevSortedColumnsRef = React.useRef<string[]>([]);

    React.useEffect(() => {
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

    const rows = Array.from({ length: TableRows }, (_, i) => i + 1);

    // Use Custom Hook for Animation
    const { animatingWidths, handleColumnAnimation } = useColumnAnimation(sortedTableColumns, selectedDate);

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

                            return (
                                <AnimatedHeaderWrapper
                                    key={colId}
                                    id={`col-${colId}`}
                                    colIndex={colIndex}
                                    width={width}
                                    headerColorClass={headerColorClass}
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
                                </AnimatedHeaderWrapper>
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

                                return (
                                    <AnimatedCellWrapper
                                        key={`${colId}-${row}`}
                                        colIndex={colIndex}
                                        width={width}
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
                                    </AnimatedCellWrapper>
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
