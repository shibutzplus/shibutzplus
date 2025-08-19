"use client";

import React, { useState } from "react";
import styles from "./HistoryTable.module.css";
import { flexRender, getCoreRowModel, useReactTable, ColumnDef } from "@tanstack/react-table";
import { TeacherRow } from "@/models/types/table";
import { TableRows } from "@/models/constant/table";
import { DailyScheduleType } from "@/models/types/dailySchedule";

interface HistoryTableProps {
    scheduleData: DailyScheduleType[];
}

const HistoryTable: React.FC<HistoryTableProps> = ({ scheduleData }) => {
    const [data] = useState<TeacherRow[]>(
        Array.from({ length: TableRows }, (_, i) => ({ hour: i + 1 })),
    );

    // Group schedule data by column ID
    const scheduleByColumn = React.useMemo(() => {
        const grouped: { [columnId: string]: { [hour: number]: DailyScheduleType } } = {};
        scheduleData.forEach(item => {
            if (!grouped[item.columnId]) {
                grouped[item.columnId] = {};
            }
            grouped[item.columnId][item.hour] = item;
        });
        return grouped;
    }, [scheduleData]);

    // Create columns based on schedule data
    const dynamicColumns = React.useMemo(() => {
        const columnIds = Object.keys(scheduleByColumn);
        return columnIds.map(columnId => {
            const firstItem = Object.values(scheduleByColumn[columnId])[0];
            const headerTitle = firstItem?.eventTitle || 
                               firstItem?.absentTeacher?.name || 
                               firstItem?.presentTeacher?.name || 
                               'Unknown';

            return {
                accessorKey: columnId,
                header: headerTitle,
                cell: (info: any) => {
                    const hour = info.row.original.hour;
                    const cellData = scheduleByColumn[columnId][hour];
                    
                    if (!cellData) return <div className={styles.emptyCell}></div>;
                    
                    if (cellData.event) {
                        return (
                            <div className={styles.eventCell}>
                                <div className={styles.eventText}>{cellData.event}</div>
                            </div>
                        );
                    }
                    
                    return (
                        <div className={styles.teacherCell}>
                            {cellData.class && (
                                <div className={styles.className}>{cellData.class.name}</div>
                            )}
                            {cellData.subject && (
                                <div className={styles.subjectName}>{cellData.subject.name}</div>
                            )}
                            {cellData.subTeacher && (
                                <div className={styles.subTeacherName}>{cellData.subTeacher.name}</div>
                            )}
                        </div>
                    );
                },
                meta: { bgColor: "#ffffff" },
            } as ColumnDef<TeacherRow>;
        });
    }, [scheduleByColumn]);

    const baseCols = React.useMemo(
        () => [
            {
                accessorKey: "hour",
                header: "שעה",
                cell: (info: any) => <span>{info.getValue()}</span>,
                meta: { bgColor: "#f5f5f5" },
            },
        ],
        [],
    );

    const columns = React.useMemo(() => [...baseCols, ...dynamicColumns], [dynamicColumns]);
    const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

    return (
        <section className={styles.tableContainer}>
            <table className={styles.scheduleTable}>
                <thead>
                    {table.getHeaderGroups().map((hg) => (
                        <tr key={hg.id}>
                            {hg.headers.map((header) => (
                                <th
                                    key={header.id}
                                    className={
                                        header.column.id === "hour"
                                            ? styles.hourCell
                                            : styles.dayHeader
                                    }
                                    style={{
                                        background: (header.column.columnDef.meta as any)?.bgColor,
                                    }}
                                >
                                    {flexRender(
                                        header.column.columnDef.header,
                                        header.getContext(),
                                    )}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {table.getRowModel().rows.map((row) => (
                        <tr key={row.id}>
                            {row.getVisibleCells().map((cell) => (
                                <td
                                    key={cell.id}
                                    className={
                                        cell.column.id === "hour"
                                            ? styles.hourCell
                                            : styles.scheduleCell
                                    }
                                >
                                    <div className={styles.cellContent}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </div>
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </section>
    );
};

export default HistoryTable;
