"use client";

import React from "react";
import styles from "./DailyTable.module.css";
import { useTable } from "@/context/TableContext";
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";

interface DailyTableProps {}

const DailyTable: React.FC<DailyTableProps> = () => {
    const { data, actionCols } = useTable();

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

    const columns = React.useMemo(() => [...baseCols, ...actionCols], [actionCols]);
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

export default DailyTable;
