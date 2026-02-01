"use client";

import React from "react";
import { motion } from "motion/react";
import styles from "./PreviewTable.module.css";
import { sortDailyColumnIdsByPosition } from "@/utils/sort";
import { calculateVisibleRowsForDaily } from "@/utils/tableUtils";
import { DailySchedule, ColumnType, ColumnTypeValues } from "@/models/types/dailySchedule";
import { AppType, ScreenType } from "@/models/types";
import { TeacherType } from "@/models/types/teachers";
import PreviewTeacherHeader from "../PreviewTeacherHeader/PreviewTeacherHeader";
import PreviewEventHeader from "../PreviewEventHeader/PreviewEventHeader";
import PreviewTeacherCell from "../PreviewTeacherCell/PreviewTeacherCell";
import PreviewEventCell from "../PreviewEventCell/PreviewEventCell";

//
//  Used in History Page (private) and in School Schedule Portal (public)
//
type PreviewTableProps = {
    mainDailyTable: DailySchedule;
    selectedDate: string;
    onTeacherClick?: (teacher: TeacherType) => Promise<void>;
    displayButton?: boolean;
    appType?: AppType;
    EmptyTable?: React.FC<{ date?: string; screenType?: ScreenType; text?: string }>;
    hoursNum?: number;
    screenType?: ScreenType;
    emptyText?: string;
};

const PreviewTable: React.FC<PreviewTableProps> = ({
    mainDailyTable,
    selectedDate,
    onTeacherClick,
    EmptyTable,
    appType = "private",
    hoursNum,
    screenType,
    emptyText,
}) => {
    const schedule = mainDailyTable[selectedDate];
    const tableColumns = schedule ? Object.keys(schedule) : [];
    const sortedTableColumns = schedule
        ? sortDailyColumnIdsByPosition(tableColumns, schedule)
        : [];

    const columnTypes = React.useMemo(() => {
        const types: Record<string, ColumnType> = {};
        if (!schedule) return types;

        sortedTableColumns.forEach((colId) => {
            const columnData = schedule[colId];
            if (!columnData) return;

            const colFirstObj =
                columnData["1"] ||
                Object.values(columnData).find((cell) => cell?.headerCol?.type !== undefined);

            types[colId] = colFirstObj?.headerCol?.type ?? ColumnTypeValues.event;
        });
        return types;
    }, [schedule, sortedTableColumns]);

    // Calculate visible rows
    const rows = React.useMemo(() => {
        return calculateVisibleRowsForDaily(
            schedule,
            sortedTableColumns,
            columnTypes,
            appType,
            hoursNum
        );
    }, [schedule, sortedTableColumns, columnTypes, hoursNum, appType]);

    const isEmpty = !schedule || Object.keys(schedule).length === 0;

    if (isEmpty && EmptyTable) {
        return <EmptyTable date={selectedDate} screenType={screenType} text={emptyText} />;
    }

    if (isEmpty) {
        return null; // Or some default empty state
    }

    return (
        <div className={styles.tableContainer}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        {/* Corner Cell */}
                        <th className={`${styles.headerCell} ${styles.cornerCell}`}>
                            <div className={`${styles.headerInner} ${styles.headerGray}`}></div>
                        </th>

                        {sortedTableColumns.map((colId, index) => {
                            const type = columnTypes[colId] ?? ColumnTypeValues.event;
                            const column = schedule[colId];

                            return (
                                <th
                                    key={colId}
                                    className={`${styles.headerCell} ${styles.regularHeaderCell}`}
                                >
                                    <motion.div
                                        style={{ width: "100%", height: "100%" }}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.3, delay: index * 0.02 }}
                                    >
                                        {type === ColumnTypeValues.event ? (
                                            <PreviewEventHeader
                                                type={type}
                                                column={column}
                                                appType={appType}
                                            />
                                        ) : (
                                            <PreviewTeacherHeader
                                                column={column}
                                                appType={appType}
                                                type={type}
                                                selectedDate={selectedDate}
                                                onTeacherClick={onTeacherClick}
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
                            <td className={styles.rowNumberCell}>
                                <div className={styles.rowNumberBadge}>{row}</div>
                            </td>

                            {sortedTableColumns.map((colId, index) => {
                                const type = columnTypes[colId] ?? ColumnTypeValues.event;
                                const columnData = schedule[colId];
                                const cellData = columnData?.[row];

                                return (
                                    <td
                                        key={`${colId}-${row}`}
                                        className={`${styles.dataCell} ${styles.regularDataCell}`}
                                    >
                                        <motion.div
                                            style={{ width: "100%", height: "100%" }}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.3, delay: index * 0.02 }}
                                        >
                                            {type === ColumnTypeValues.event ? (
                                                <PreviewEventCell cell={cellData} columnId={colId} />
                                            ) : (
                                                <PreviewTeacherCell
                                                    cell={cellData}
                                                    columnId={colId}
                                                    type={type}
                                                    appType={appType}
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

export default PreviewTable;
