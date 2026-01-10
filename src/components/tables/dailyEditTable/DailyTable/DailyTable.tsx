import React, { useMemo } from "react";
import { motion } from "motion/react";
import { useMainContext } from "@/context/MainContext";
import EmptyTable from "@/components/empty/EmptyTable/EmptyTable";
import DailyTeacherHeader from "../DailyTeacherHeader/DailyTeacherHeader";
import DailyTeacherCell from "../DailyTeacherCell/DailyTeacherCell";
import DailyEventHeader from "../DailyEventHeader/DailyEventHeader";
import DailyEventCell from "../DailyEventCell/DailyEventCell";
import { useColumnAnimation } from "./useColumnAnimation";
import { sortDailyColumnIdsByPosition } from "@/utils/sort";
import { HOURS_IN_DAY } from "@/utils/time";
import { TeacherType } from "@/models/types/teachers";
import { DailySchedule, ColumnType, ColumnTypeValues } from "@/models/types/dailySchedule";
import styles from "./DailyTable.module.css";

type AnimatedHeaderWrapperProps = {
    colIndex: number;
    width: number | undefined;
    headerColorClass: string;
    children: React.ReactNode;
    id?: string;
};

const AnimatedHeaderWrapper: React.FC<AnimatedHeaderWrapperProps> = React.memo(({ width, headerColorClass, children, id }) => {
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
            >
                {children}
            </motion.div>
        </th>
    );
});
AnimatedHeaderWrapper.displayName = "AnimatedHeaderWrapper";

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
                initial={{ opacity: 0.4 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: colIndex * 0.02 }}
            >
                {children}
            </motion.div>
        </td>
    );
});
AnimatedCellWrapper.displayName = "AnimatedCellWrapper";


// --- Main Properties ---

type DailyTableProps = {
    mainDailyTable: DailySchedule;
    selectedDate: string;
    onTeacherClick?: (teacher: TeacherType) => void;
};

const DailyTable: React.FC<DailyTableProps> = ({
    mainDailyTable,
    selectedDate,
    onTeacherClick,
}) => {
    const { settings } = useMainContext();

    const hoursNum = settings?.hoursNum || HOURS_IN_DAY;

    const schedule = mainDailyTable[selectedDate];
    const sortedTableColumns = useMemo(() => {
        if (!schedule) return [];
        const tableColumns = Object.keys(schedule);
        return sortDailyColumnIdsByPosition(tableColumns, schedule);
    }, [schedule]);

    const prevSortedColumnsRef = React.useRef<string[]>([]);

    React.useEffect(() => {
        // Compare current columns with previous to find the new one
        if (prevSortedColumnsRef.current.length < sortedTableColumns.length) {
            const newColumns = sortedTableColumns.filter((colId: string) => !prevSortedColumnsRef.current.includes(colId));

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

    // Use Custom Hook for Animation
    const { animatingWidths, handleColumnAnimation } = useColumnAnimation(sortedTableColumns, selectedDate);

    // Calculate column types once
    const columnTypes = useMemo(() => {
        const types: Record<string, ColumnType> = {};
        if (!schedule) return types;

        sortedTableColumns.forEach((colId: string) => {
            const columnData = schedule[colId];

            // Fallback to type from ID prefix for old data stability
            const inferredType: ColumnType = ColumnTypeValues.missingTeacher;

            if (!columnData) {
                types[colId] = inferredType;
                return;
            }

            const headerCol = columnData["1"]?.headerCol ||
                Object.values(columnData).find(cell => cell.headerCol)?.headerCol;

            types[colId] = headerCol?.type || inferredType;
        });
        return types;
    }, [schedule, sortedTableColumns]);

    const rows = useMemo(() => {
        return Array.from({ length: hoursNum }, (_, i) => i + 1);
    }, [hoursNum]);

    const getColorClass = (type: ColumnType) => {
        switch (type) {
            case ColumnTypeValues.existingTeacher:
                return styles.headerBlue;
            case ColumnTypeValues.missingTeacher:
                return styles.headerRed;
            case ColumnTypeValues.event:
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

                        {sortedTableColumns.map((colId: string, colIndex: number) => {
                            const type = columnTypes[colId] || ColumnTypeValues.event;
                            const headerColorClass = getColorClass(type);
                            const width = animatingWidths[colId];
                            const isAnimating = width !== undefined;

                            const isFirst = colIndex === 0;
                            const isLast = colIndex === sortedTableColumns.length - 1;

                            return (
                                <AnimatedHeaderWrapper
                                    key={colId}
                                    id={`col-${colId}`}
                                    colIndex={colIndex}
                                    width={width}
                                    headerColorClass={headerColorClass}
                                >
                                    {type === ColumnTypeValues.event ? (
                                        <DailyEventHeader
                                            columnId={colId}
                                            onDelete={isAnimating ? undefined : (id) => handleColumnAnimation(id, "remove")}
                                            isFirst={isFirst}
                                            isLast={isLast}
                                        />
                                    ) : (
                                        <DailyTeacherHeader
                                            columnId={colId}
                                            type={type}
                                            onDelete={isAnimating ? undefined : (id) => handleColumnAnimation(id, "remove")}
                                            onTeacherClick={onTeacherClick}
                                            isFirst={isFirst}
                                            isLast={isLast}
                                        />
                                    )}
                                </AnimatedHeaderWrapper>
                            );
                        })}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row: number) => (
                        <tr key={row}>
                            <td
                                className={styles.rowNumberCell}
                            >
                                <div className={styles.rowNumberBadge}>
                                    {row}
                                </div>
                            </td>

                            {sortedTableColumns.map((colId: string, colIndex: number) => {
                                const type = columnTypes[colId] || ColumnTypeValues.event;
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
                                        {type === ColumnTypeValues.event ? (
                                            <DailyEventCell cell={cellData} columnId={colId} />
                                        ) : (
                                            <DailyTeacherCell
                                                key={`${colId}-${row}-${cellData?.subTeacher?.id || cellData?.classes?.[0]?.id || 'empty'}`}
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
