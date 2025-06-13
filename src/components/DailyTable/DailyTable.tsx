"use client";

import React from "react";
import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table";
import styles from "./DailyTable.module.css";
import { useTable } from "@/context/TableContext";

const DailyTable: React.FC = () => {
    const { state } = useTable();
    const { data, actionCols } = state;

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
        <div className={styles.container}>
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        {table.getHeaderGroups().map((hg) => (
                            <tr key={hg.id}>
                                {hg.headers.map((header) => (
                                    <th
                                        key={header.id}
                                        className={`${styles.headerCell} ${header.column.id === "hour" ? styles.hourCell : ""}`}
                                        style={{
                                            background: (header.column.columnDef.meta as any)
                                                ?.bgColor,
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
                                    <td key={cell.id} className={styles.cell}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DailyTable;
