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
import { DailyTableColors } from "@/style/tableColors";

interface ReadOnlyDailyTableProps {
    scheduleData: DailyScheduleType[];
}

const COLOR_BY_TYPE = {
    missingTeacher: DailyTableColors.missingTeacher.headerColor,
    existingTeacher: DailyTableColors.existingTeacher.headerColor,
    event: DailyTableColors.event.headerColor,
} as const;

const ReadOnlyDailyTable: React.FC<ReadOnlyDailyTableProps> = ({ scheduleData }) => {
    const [data] = useState<TeacherRow[]>(
        Array.from({ length: TableRows }, (_, i) => ({ hour: i + 1 }))
    );

    const hasData = Array.isArray(scheduleData) && scheduleData.length > 0;

    const scheduleByColumn = React.useMemo(() => {
        if (!hasData) return {};
        const order = { missingTeacher: 0, existingTeacher: 1, event: 2 } as const;
        const sorted = [...scheduleData].sort((a, b) => order[a.issueTeacherType] - order[b.issueTeacherType]);
        const grouped: Record<string, Record<number, DailyScheduleType>> = {};
        for (const item of sorted) {
            if (!grouped[item.columnId]) grouped[item.columnId] = {};
            grouped[item.columnId][item.hour] = item;
        }
        return grouped;
    }, [scheduleData, hasData]);

    const headerItems = React.useMemo(() => {
        const columnIds = Object.keys(scheduleByColumn);
        return columnIds.map((columnId) => {
            const firstItem = Object.values(scheduleByColumn[columnId])[0];
            const title = firstItem?.eventTitle || firstItem?.issueTeacher?.name || "";
            const color = COLOR_BY_TYPE[firstItem!.issueTeacherType as keyof typeof COLOR_BY_TYPE];
            return { title, color };
        });
    }, [scheduleByColumn]);

    const dynamicColumns = React.useMemo(() => {
        const columnIds = Object.keys(scheduleByColumn);
        return columnIds.map((columnId) => {
            return {
                accessorKey: columnId,
                cell: (info: any) => {
                    const hour = info.row.original.hour as number;
                    const cellData = scheduleByColumn[columnId][hour];
                    if (!cellData) return <div className={styles.emptyCell}></div>;
                    if (cellData.issueTeacherType === "event" && cellData.event) return <ReadOnlyEventCell cellData={cellData} />;
                    return <ReadOnlyTeacherCell cellData={cellData} />;
                },
            } as ColumnDef<TeacherRow>;
        });
    }, [scheduleByColumn]);

    const baseCols = React.useMemo(
        () =>
            [
                {
                    accessorKey: "hour",
                    header: "שעה",
                    cell: (info: any) => <span>{info.getValue()}</span>,
                },
            ] as ColumnDef<TeacherRow>[],
        []
    );

    const columns = React.useMemo(() => [...baseCols, ...dynamicColumns], [baseCols, dynamicColumns]);
    const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

    return (
        <section className={styles.tableContainer}>
            {!hasData ? (
                <div className={styles.noDataMessage}>אין נתונים להצגה <br /> לא פורסמה מערכת ליום זה</div>
            ) : (
                <table className={styles.scheduleTable}>
                    <ReadOnlyDailyHeader items={headerItems} />
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
            )}
        </section>
    );
};

export default ReadOnlyDailyTable;
