"use client";

import React, { useMemo } from "react";
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

    const rows = Array.from({ length: TableRows }, (_, i) => i + 1);

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

                            return (
                                <th
                                    key={colId}
                                    className={`${styles.headerCell} ${styles.regularHeaderCell}`}
                                >
                                    <div className={`${styles.headerInner} ${headerColorClass}`}>
                                        {type === "event" ? (
                                            <DailyEventHeader columnId={colId} type={type} />
                                        ) : (
                                            <DailyTeacherHeader
                                                columnId={colId}
                                                type={type}
                                                onTeacherClick={onTeacherClick}
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
                                const cellData = schedule[colId][row]; // row is the hour index

                                return (
                                    <td
                                        key={`${colId}-${row}`}
                                        className={`${styles.dataCell} ${styles.regularDataCell}`}
                                    >
                                        <div className={styles.cellContent}>
                                            {type === "event" ? (
                                                <DailyEventCell cell={cellData} columnId={colId} />
                                            ) : (
                                                <DailyTeacherCell
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
