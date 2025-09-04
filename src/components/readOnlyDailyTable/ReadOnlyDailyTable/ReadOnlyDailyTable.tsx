"use client";

import React, { useState } from "react";
import styles from "./ReadOnlyDailyTable.module.css";
import { getCoreRowModel, useReactTable, ColumnDef } from "@tanstack/react-table";
import { TeacherRow } from "@/models/types/table";
import { TableRows } from "@/models/constant/table";
import { DailyScheduleType } from "@/models/types/dailySchedule";
import ReadOnlyDailyHeader from "../ReadOnlyDailyHeader/ReadOnlyDailyHeader";
import ReadOnlyTeacherCell from "../ReadOnlyTeacherCell/ReadOnlyTeacherCell";
import ReadOnlyEventCell from "../ReadOnlyEventCell/ReadOnlyEventCell";
import ReadOnlyDailyCell from "../ReadOnlyDailyCell/ReadOnlyDailyCell";

interface ReadOnlyDailyTableProps {
    scheduleData: DailyScheduleType[];
}

const ReadOnlyDailyTable: React.FC<ReadOnlyDailyTableProps> = ({ scheduleData }) => {
    const [data] = useState<TeacherRow[]>(
        Array.from({ length: TableRows }, (_, i) => ({ hour: i + 1 })),
    );

    // Sort scheduleData by issueTeacherType: [missingTeacher], [existingTeacher], [event]
    const scheduleByColumn = React.useMemo(() => {
        const typeOrder = {
            missingTeacher: 0,
            existingTeacher: 1,
            event: 2,
        };
        const sortedData = [...scheduleData].sort((a, b) => {
            return typeOrder[a.issueTeacherType] - typeOrder[b.issueTeacherType];
        });
        const grouped: { [columnId: string]: { [hour: number]: DailyScheduleType } } = {};
        sortedData.forEach((item) => {
            if (!grouped[item.columnId]) {
                grouped[item.columnId] = {};
            }
            grouped[item.columnId][item.hour] = item;
        });
        return grouped;
    }, [scheduleData]);

    const headers = React.useMemo(() => {
        const columnIds = Object.keys(scheduleByColumn);
        return columnIds.map((columnId) => {
            const firstItem = Object.values(scheduleByColumn[columnId])[0];
            const headerTitle = firstItem?.eventTitle || firstItem?.issueTeacher?.name || "";
            return headerTitle;
        });
    }, [scheduleByColumn]);

    // Create columns based on schedule data
    const dynamicColumns = React.useMemo(() => {
        const columnIds = Object.keys(scheduleByColumn);
        return columnIds.map((columnId) => {
            return {
                accessorKey: columnId,
                cell: (info: any) => {
                    const hour = info.row.original.hour;
                    const cellData = scheduleByColumn[columnId][hour];
                    if (!cellData) return <div className={styles.emptyCell}></div>;
                    if (cellData.event) return <ReadOnlyEventCell cellData={cellData} />;
                    return <ReadOnlyTeacherCell cellData={cellData} />;
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
                <ReadOnlyDailyHeader titles={headers} />
                <tbody>
                    {table.getRowModel().rows.map((row) => (
                        <tr key={row.id}>
                            {row.getVisibleCells().map((cell) => (
                                <ReadOnlyDailyCell key={cell.id} cell={cell} />
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </section>
    );
};

export default ReadOnlyDailyTable;
